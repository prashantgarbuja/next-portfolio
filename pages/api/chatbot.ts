import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message?: string;
  requestId?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, chatbotId, sessionId } = req.body;

    // Validate required fields
    if (!message || !sessionId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: message and sessionId" });
    }

    // Ensure CHATBOT_WEBHOOK is defined
    const webhookUrl = process.env.CHATBOT_WEBHOOK;
    if (!webhookUrl) {
      throw new Error("CHATBOT_WEBHOOK environment variable is not set");
    }

    // Generate a unique request ID
    const requestId = `${sessionId}-${Date.now()}`;

    // Trigger n8n webhook asynchronously (fire-and-forget)
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        chatbotId,
        sessionId,
        requestId,
      }),
    }).catch((error) => {
      console.error("Error triggering n8n:", error);
      // Log silently; don’t block response
    });

    // Return immediately with a processing status
    res.status(202).json({ message: "Processing your request", requestId });
  } catch (error) {
    console.error("Error in /api/chatbot:", error);
    res.status(500).json({ error: "Failed to connect to chatbot service" });
  }
}
