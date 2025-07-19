"use server";

import { env } from "@/env";
import { Octokit } from "octokit";

export async function getGitHubStats(repoUrl: string) {
  const githubClient = new Octokit({ auth: env.GITHUB_TOKEN });
  const urlParts = repoUrl
    .replace("https://github.com/", "")
    .replace(".git", "")
    .split("/");

  const [owner, repo] = urlParts;

  if (!owner || !repo) {
    throw new Error("Invalid repository URL");
  }

  const { data } = await githubClient.rest.repos.get({ owner, repo });

  const repoStats = {
    forks: data.forks_count,
    stars: data.stargazers_count,
    lastCommit: data.pushed_at,
    createdAt: data.created_at,
    license: {
      name: data.license?.name,
      key: data.license?.key,
    },
  };

  return repoStats;
}

export async function getRepoReadme(repoUrl: string): Promise<string | null> {
  const githubClient = new Octokit({ auth: env.GITHUB_TOKEN });
  const urlParts = repoUrl
    .replace("https://github.com/", "")
    .replace(".git", "")
    .split("/");
  const [owner, repo] = urlParts;

  if (!owner || !repo) {
    return null;
  }

  try {
    const { data } = await githubClient.rest.repos.getReadme({ owner, repo });

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content;
  } catch (error) {
    console.error("Failed to fetch README:", error);
    return null;
  }
}
