import { inngest } from "./client";
import { getGitHubStats, getRepoReadme } from "@/lib/github";
import { ModelProvider } from "@/lib/ai/types";
import {
  createServer,
  updateServerStats,
  updateServerContent,
  getAllCategories,
  createCategories,
  assignCategoriesToServer,
} from "@/data-access/servers";
import { runObjectPrompt } from "@/lib/ai/core";
import { categorizeServerTemplate } from "@/lib/ai/prompts/categorize-server";
import { generateContentTemplate } from "@/lib/ai/prompts/generate-content";

export interface CreateServerData {
  name: string;
  homepageUrl: string;
  repoUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
  aiContext?: string;
  submissionId?: string;
}

export const handleServerCreated = inngest.createFunction(
  {
    id: "handle-server-created",
    name: "Handle Server Created",
  },
  { event: "server/created" },
  async ({ event, step, logger }) => {
    const payload = event.data as CreateServerData;

    logger.info("Task started with payload", { payload });

    const {
      name,
      homepageUrl,
      repoUrl,
      docsUrl,
      logoUrl,
      aiContext,
    } = payload;

    if (!name || !homepageUrl) {
      throw new Error("Missing required fields: name and homepageUrl");
    }

    logger.info("Creating server and processing", {
      name,
      homepageUrl,
      hasRepoUrl: !!repoUrl,
    });

    const newServer = await step.run("create-server", async () => {
      return createServer({
        name,
        homepageUrl,
        repoUrl,
        docsUrl,
        logoUrl,
      });
    });

    const { id: serverId, slug } = newServer;
    logger.info("Server created in database", { serverId, slug });

    const repoStats = await step.run("fetch-github-stats", async () => {
      logger.info("Starting GitHub stats fetch");
      let targetRepoUrl = repoUrl;
      if (!targetRepoUrl && homepageUrl?.includes("github.com")) {
        targetRepoUrl = homepageUrl;
        logger.info("Using homepage URL as repo URL", { homepageUrl });
      }

      let stats = {
        stars: 0,
        lastCommit: new Date(),
        license: "unknown",
        forks: 0,
      };

      if (targetRepoUrl) {
        try {
          logger.info("Fetching GitHub stats", { repoUrl: targetRepoUrl });
          const [githubStats, readmeContent] = await Promise.all([
            getGitHubStats(targetRepoUrl),
            getRepoReadme(targetRepoUrl),
          ]);

          await updateServerStats({
            serverId,
            stars: githubStats.stars,
            lastCommit: new Date(githubStats.lastCommit),
            license: githubStats.license.key || "unknown",
            readmeContent: readmeContent || undefined,
          });

          stats = {
            stars: githubStats.stars,
            lastCommit: new Date(githubStats.lastCommit),
            license: githubStats.license.key || "unknown",
            forks: githubStats.forks,
          };

          logger.info("GitHub stats updated", {
            stars: githubStats.stars,
            license: githubStats.license.key,
          });
        } catch (error) {
          logger.error("Failed to fetch GitHub stats", {
            error,
            repoUrl: targetRepoUrl,
          });
        }
      } else {
        logger.info("No GitHub repo URL found, skipping GitHub stats");
      }

      return { stats, targetRepoUrl };
    });

    const aiContent = await step.run("generate-ai-content", async () => {
      logger.info("Starting AI content generation");
      // Skip README fetching to reduce token usage

      let content = {
        shortDesc: "MCP server description",
        longDesc: "MCP server description",
        features: [] as string[],
      };

      try {
        logger.info("Generating AI content", {
          hasAiContext: !!aiContext,
          model: ModelProvider.ANTHROPIC,
        });

        const variables = {
          serverName: name,
          homepageUrl,
          repoUrl: repoStats.targetRepoUrl || "",
          docsUrl: docsUrl || "",
          additionalContext: aiContext || "",
          repoReadme: "",
          repoStats: JSON.stringify({
            stars: repoStats.stats.stars,
            forks: repoStats.stats.forks,
            license: repoStats.stats.license,
            lastCommit: repoStats.stats.lastCommit,
          }),
        };

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await runObjectPrompt(
          ModelProvider.ANTHROPIC,
          generateContentTemplate,
          variables,
        );

        logger.info("AI response received", { response });

        // Extract the actual object from the response
        const aiResult = response?.object;

        // Check if AI returned the expected structure
        if (aiResult && typeof aiResult === "object") {
          const shortDesc = aiResult.summary || "MCP server description";

          await updateServerContent({
            serverId,
            shortDesc,
            longDesc: null, // No longer generating long descriptions
          });

          content = {
            shortDesc,
            longDesc: "",
            features: [],
          };

          logger.info("AI content generated and updated", {
            shortDescLength: shortDesc.length,
          });
        } else {
          logger.error("AI returned unexpected structure", { aiResult });
        }
      } catch (error) {
        logger.error("Failed to generate AI content", { error });
      }

      return content;
    });

    const assignedCategories = await step.run("categorize-server", async () => {
      logger.info("Starting server categorization");
      let categories: string[] = [];

      try {
        const existingCategories = await getAllCategories();
        const categoryNames = existingCategories.map((cat) => cat.name);

        logger.info("Categorizing server with AI", {
          name,
          existingCategoriesCount: categoryNames.length,
          model: ModelProvider.ANTHROPIC,
        });

        const variables = {
          serverName: name,
          categories: categoryNames.join(","),
          additionalContext: aiContext || "",
          shortDescription: aiContent.shortDesc,
          longDescription: aiContent.longDesc,
        };
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categorizationResponse: any = await runObjectPrompt(
          ModelProvider.ANTHROPIC,
          categorizeServerTemplate,
          variables,
        );

        // Extract the actual object from the response
        const categorization = categorizationResponse?.object || {};

        // Ensure arrays exist
        const categoriesToAdd = Array.isArray(categorization.categoriesToAdd)
          ? categorization.categoriesToAdd
          : [];
        const matchedCategories = Array.isArray(categorization.categories)
          ? categorization.categories
          : [];

        logger.info("Categorization result", {
          matchedCategories,
          categoriesToAdd,
          totalCategories: matchedCategories.length + categoriesToAdd.length,
        });

        if (categoriesToAdd.length > 0) {
          await createCategories(categoriesToAdd);
          logger.info("Created new categories", {
            categories: categoriesToAdd,
          });
        }

        const allCategoryNames = [...matchedCategories, ...categoriesToAdd];

        // Ensure we have at least one category
        if (allCategoryNames.length === 0) {
          allCategoryNames.push("Miscellaneous");
          await createCategories(["Miscellaneous"]);
          logger.info("Added fallback category: Miscellaneous");
        }

        categories = await assignCategoriesToServer(serverId, allCategoryNames);

        logger.info("Categories assigned", { categories });
      } catch (error) {
        logger.error("Failed to categorize server", { error });
      }

      return categories;
    });

    // TODO LATER
    // await step.run("generate-search-vector", async () => {
    //   logger.info("Generating search vector");
    //   const searchContent = [
    //     name,
    //     aiContent.shortDesc,
    //     aiContent.longDesc,
    //     ...assignedCategories,
    //     ...aiContent.features,
    //   ]
    //     .filter(Boolean)
    //     .join(" ");

    //   logger.info("Search vector prepared", {
    //     contentLength: searchContent.length,
    //     categories: assignedCategories.length,
    //   });
    // });

    // if (submissionId) {
    //   await step.run("update-submission", async () => {
    //     logger.info("Updating submission status", { submissionId });
    //   });
    // }

    logger.info("Server processing completed", {
      slug,
      categoriesAssigned: assignedCategories.length,
      repoStars: repoStats.stats.stars,
    });

    return {
      serverId,
      slug,
      name,
      shortDesc: aiContent.shortDesc,
      longDesc: aiContent.longDesc,
      features: aiContent.features,
      repoStats: repoStats.stats,
      logoUrl,
      categories: assignedCategories,
      processingComplete: true,
    };
  },
);
