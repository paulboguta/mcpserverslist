"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitServerInput } from "@/types/submission";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { submitServer } from "../../actions/submissions";

export default function SubmitPage() {
  const { execute, status } = useServerAction(submitServer);
  const isPending = status === "pending";

  const form = useForm<SubmitServerInput>({
    defaultValues: {
      name: "",
      email: "",
      serverName: "",
      repoUrl: "",
      description: "",
    },
  });

  async function onSubmit(data: SubmitServerInput) {
    try {
      const [result, error] = await execute(data);
      if (error) throw error;

      if (result?.success) {
        form.reset();
        toast.success(result.message);
      } else {
        toast.error(
          result?.message || "Failed to submit MCP server. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  }

  return (
    <div className="px-8">
      <section className="mx-auto flex flex-col gap-3 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <h1 className="text-3xl font-bold leading-[1.1] tracking-tight">
          Submit Your MCP Server
        </h1>
        <p className="max-w-[550px] text-lg text-muted-foreground font-light leading-tight">
          Share your MCP server with the community. Help others discover great
          Model Context Protocol servers.
        </p>
      </section>

      <section className="pb-24 max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="John Doe"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="john@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serverName">MCP Server Name</Label>
                <Input
                  id="serverName"
                  {...form.register("serverName")}
                  placeholder="My Awesome MCP Server"
                />
                {form.formState.errors.serverName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.serverName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input
                  id="repoUrl"
                  {...form.register("repoUrl")}
                  placeholder="https://github.com/username/mcp-server"
                />
                {form.formState.errors.repoUrl && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.repoUrl.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Tell us about your MCP server..."
                className="h-32"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit MCP Server"}
            </Button>
          </form>
        </Form>
      </section>
    </div>
  );
}