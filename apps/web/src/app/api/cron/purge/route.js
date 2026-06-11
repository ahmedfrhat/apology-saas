import sql from "@/app/api/utils/sql";

async function runPurge(request) {
  const url = new URL(request.url);
  const secretQuery = url.searchParams.get("secret");
  const authHeader = request.headers.get("Authorization");
  const secretHeader = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  const cronSecret = process.env.CRON_SECRET || "apology-cron-secret-2026";
  const providedSecret = secretQuery || secretHeader;

  if (!providedSecret || providedSecret !== cronSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Purge session tracking rows older than 30 days
    const trackingPurged = await sql`
      DELETE FROM live_tracking
      WHERE updated_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `;

    // Purge shadow recipient interactions older than 30 days
    const interactionsPurged = await sql`
      DELETE FROM recipient_interactions
      WHERE created_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `;

    return Response.json({
      success: true,
      purged: {
        trackingCount: trackingPurged.length,
        interactionsCount: interactionsPurged.length
      }
    });
  } catch (error) {
    console.error("[cron/purge] error", error);
    return Response.json({ error: "Failed to purge database records" }, { status: 500 });
  }
}

export async function GET(request) {
  return runPurge(request);
}

export async function POST(request) {
  return runPurge(request);
}
