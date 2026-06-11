import Pusher from "pusher";

// Lazy initialization of Pusher to prevent startup errors if envs are missing
let pusher = null;
const initPusher = () => {
  if (pusher) return pusher;
  
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER;

  if (appId && key && secret && cluster) {
    try {
      pusher = new Pusher({
        appId,
        key,
        secret,
        cluster,
        useTLS: true
      });
      return pusher;
    } catch (e) {
      console.error("Failed to initialize Pusher server", e);
    }
  }
  return null;
};

export async function POST(request, context, c) {
  try {
    const { slug } = context.params;
    let body;
    const nodeReq = c?.env?.incoming || {};
    if (nodeReq.body) {
      body = typeof nodeReq.body === "string" ? JSON.parse(nodeReq.body) : nodeReq.body;
    } else {
      body = await request.json();
    }

    const { session_id, event, data = {} } = body || {};

    if (!event) {
      return Response.json({ error: "event is required" }, { status: 400 });
    }

    const activePusher = initPusher();
    const channelName = `apology-${slug}`;

    if (activePusher) {
      await activePusher.trigger(channelName, event, {
        session_id,
        ...data
      });
      return Response.json({ success: true, channel: channelName });
    } else {
      // Print to server logs for testing when Pusher keys are missing
      console.log(`[MOCK REALTIME BROADCAST] [Channel: ${channelName}] [Event: ${event}]`, {
        session_id,
        ...data
      });
      return Response.json({ success: true, channel: channelName, mocked: true });
    }
  } catch (error) {
    console.error("[realtime/trigger/POST] error", error);
    return Response.json({ error: "Failed to broadcast realtime event" }, { status: 500 });
  }
}
