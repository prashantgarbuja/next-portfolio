import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

type Data = {
  message?: string;
  status?: string;
  error?: string;
};

// Initialize Redis using environment variables
const redis = Redis.fromEnv();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { requestId } = req.query;

  if (typeof requestId !== "string") {
    return res.status(400).json({ error: "Invalid requestId" });
  }

  try {
    // Explicitly type the result as string | null
    const result = (await redis.get(`chatbot:${requestId}`)) as string | null;

    if (result) {
      await redis.del(`chatbot:${requestId}`);
      return res.status(200).json({ message: result });
    }

    res.status(202).json({ message: "Processing" });
  } catch (error) {
    console.error("Error checking Redis:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to check response",
    });
  }
}
