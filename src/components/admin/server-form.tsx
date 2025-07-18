"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Server } from "@/lib/db/schema";
import { useState } from "react";
import { useServerAction } from "zsa-react";
import { uploadLogoAction } from "@/app/actions/upload";

const serverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDesc: z.string().min(1, "Short description is required").max(160, "Short description must be 160 characters or less"),
  longDesc: z.string().optional(),
  homepageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  repoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  docsUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  stars: z.number().int().min(0).optional(),
  license: z.string().optional(),
});

type ServerFormData = z.infer<typeof serverSchema>;

interface ServerFormProps {
  server?: Server | null;
  onSubmit: (data: ServerFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServerForm({ server, onSubmit, onCancel, isLoading }: ServerFormProps) {
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>("");

  const { execute: uploadLogo, isPending: isUploading } = useServerAction(uploadLogoAction, {
    onSuccess: ({ data }) => {
      setUploadedLogoUrl(data.logoUrl);
    },
    onError: ({ err }) => {
      console.error("Failed to upload logo:", err);
      alert("Failed to upload logo: " + err.message);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: server ? {
      name: server.name,
      slug: server.slug,
      shortDesc: server.shortDesc,
      longDesc: server.longDesc || "",
      homepageUrl: server.homepageUrl || "",
      repoUrl: server.repoUrl || "",
      docsUrl: server.docsUrl || "",
      logoUrl: server.logoUrl || "",
      stars: server.stars || 0,
      license: server.license || "",
    } : {
      stars: 0,
    },
  });

  const currentLogoUrl = watch("logoUrl");

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo({ file });
    }
  };

  const handleFormSubmit = (data: ServerFormData) => {
    const finalData = {
      ...data,
      logoUrl: uploadedLogoUrl || data.logoUrl,
    };
    onSubmit(finalData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {server ? "Edit Server" : "Add New Server"}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              className={errors.slug ? "border-red-500" : ""}
            />
            {errors.slug && (
              <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="shortDesc">Short Description *</Label>
          <Textarea
            id="shortDesc"
            {...register("shortDesc")}
            className={errors.shortDesc ? "border-red-500" : ""}
            rows={2}
          />
          {errors.shortDesc && (
            <p className="text-sm text-red-500 mt-1">{errors.shortDesc.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="longDesc">Long Description</Label>
          <Textarea
            id="longDesc"
            {...register("longDesc")}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="homepageUrl">Homepage URL</Label>
            <Input
              id="homepageUrl"
              type="url"
              {...register("homepageUrl")}
              className={errors.homepageUrl ? "border-red-500" : ""}
            />
            {errors.homepageUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.homepageUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="repoUrl">Repository URL</Label>
            <Input
              id="repoUrl"
              type="url"
              {...register("repoUrl")}
              className={errors.repoUrl ? "border-red-500" : ""}
            />
            {errors.repoUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.repoUrl.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="docsUrl">Documentation URL</Label>
            <Input
              id="docsUrl"
              type="url"
              {...register("docsUrl")}
              className={errors.docsUrl ? "border-red-500" : ""}
            />
            {errors.docsUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.docsUrl.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              {...register("logoUrl")}
              className={errors.logoUrl ? "border-red-500" : ""}
              value={uploadedLogoUrl || currentLogoUrl}
              onChange={(e) => setValue("logoUrl", e.target.value)}
            />
            {errors.logoUrl && (
              <p className="text-sm text-red-500 mt-1">{errors.logoUrl.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="logoFile">Upload Logo</Label>
          <Input
            id="logoFile"
            type="file"
            accept="image/*"
            onChange={handleLogoFileChange}
            disabled={isUploading}
          />
          {isUploading && (
            <p className="text-sm text-blue-500 mt-1">Uploading logo...</p>
          )}
          {uploadedLogoUrl && (
            <p className="text-sm text-green-500 mt-1">Logo uploaded successfully!</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stars">Stars</Label>
            <Input
              id="stars"
              type="number"
              {...register("stars", { valueAsNumber: true })}
              className={errors.stars ? "border-red-500" : ""}
            />
            {errors.stars && (
              <p className="text-sm text-red-500 mt-1">{errors.stars.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="license">License</Label>
            <Input
              id="license"
              {...register("license")}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading || isUploading ? "Saving..." : server ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}