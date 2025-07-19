"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Save, Image } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { triggerServerCreation } from "@/lib/actions/create-server";
import { revalidateServerCache } from "@/lib/admin/cache";

const createServerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  homepageUrl: z.string().url("Please enter a valid homepage URL"),
  repoUrl: z.string().url().optional().or(z.literal("")),
  docsUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  logoFile: z.instanceof(File).optional(),
  aiContext: z.string().optional(),
});

type CreateServerValues = z.infer<typeof createServerSchema>;

interface CreateServerDialogProps {
  onServerCreated?: () => void;
}

export function CreateServerDialog({ onServerCreated }: CreateServerDialogProps) {
  const [open, setOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CreateServerValues>({
    resolver: zodResolver(createServerSchema),
    defaultValues: {
      name: "",
      homepageUrl: "",
      repoUrl: "",
      docsUrl: "",
      logoUrl: "",
      logoFile: undefined,
      aiContext: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PNG, JPEG, or WebP image');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      form.setValue('logoFile', file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: CreateServerValues) => {
    setIsSubmitting(true);
    
    try {
      // If no logo file and no logo URL provided, use favicon from homepage
      if (!values.logoFile && !values.logoUrl && values.homepageUrl) {
        try {
          const url = new URL(values.homepageUrl);
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
          values.logoUrl = faviconUrl;
        } catch (error) {
          console.warn('Failed to generate favicon URL:', error);
        }
      }

      // TODO: Handle file upload to R2 if logoFile is provided
      let finalLogoUrl = values.logoUrl;
      if (values.logoFile) {
        // For now, we'll use the preview URL or fallback to favicon
        finalLogoUrl = values.logoUrl || (values.homepageUrl ? `https://www.google.com/s2/favicons?domain=${new URL(values.homepageUrl).hostname}&sz=128` : undefined);
      }

      // Trigger the background task that creates the server and processes it
      const result = await triggerServerCreation({
        name: values.name,
        homepageUrl: values.homepageUrl,
        repoUrl: values.repoUrl || undefined,
        docsUrl: values.docsUrl || undefined,
        logoUrl: finalLogoUrl,
        aiContext: values.aiContext || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to trigger server creation");
      }

      // Revalidate cache after triggering
      const slug = values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      // await revalidateServerCache(slug);

      toast.success("Server creation started! Processing in background...");
      form.reset();
      setLogoPreview(null);
      setOpen(false);
      onServerCreated?.();
      router.refresh();
    } catch (error) {
      console.error('Failed to create server:', error);
      toast.error(`Failed to create server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New MCP Server</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="homepageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Homepage URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="docsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documentation URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aiContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Context</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Logo</h3>
                </div>
                {logoPreview && (
                  <div className="h-12 w-12 rounded-lg border p-1">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="logoFile"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Upload Logo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleFileChange}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Creating..." : "Create Server"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}