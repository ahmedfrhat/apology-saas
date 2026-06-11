import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || "",
    secretAccessKey: process.env.R2_SECRET_KEY || "",
  },
  region: "auto",
});

export async function GET(request, { params }) {
  // Catch-all parameter in React Router is accessed via params["*"]
  const key = params["*"];

  if (!key) {
    return Response.json({ error: "Asset key is required" }, { status: 400 });
  }

  const bucket = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "apology";

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Get stream or buffer
    const bodyStream = response.Body;
    const contentType = response.ContentType || "image/webp";

    return new Response(bodyStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`Failed to serve asset ${key} from R2:`, error);
    return Response.json({ error: "Asset not found" }, { status: 404 });
  }
}
