import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
  },
  region: "auto",
});

export async function GET(request, { params }) {
  const { slug } = params;
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get("filename");
    const contentType = url.searchParams.get("contentType") || "image/webp";

    if (!filename) {
      return Response.json({ error: "Filename is required" }, { status: 400 });
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `uploads/${slug}/${Date.now()}-${cleanFilename}`;
    const bucket = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "apology";

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return Response.json({
      uploadUrl: presignedUrl,
      key: key,
      assetUrl: `/api/assets/${key}`,
    });
  } catch (error) {
    console.error("Failed to generate pre-signed URL:", error);
    return Response.json({ error: "Failed to generate pre-signed URL" }, { status: 500 });
  }
}
