import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "@/env";

const r2Client = new S3Client({
  region: "auto",
  endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadLogo(file: File): Promise<string> {
  const fileName = `logos/${Date.now()}-${file.name}`;

  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    },
  });

  await upload.done();

  return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
}
