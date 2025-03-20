import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

type Data = {
  message?: string;
  error?: string;
};

const redis = Redis.fromEnv();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { requestId, output } = req.body;

  if (!requestId || !output) {
    return res.status(400).json({ error: "Missing requestId or output" });
  }

  try {
    await redis.set(`chatbot:${requestId}`, output, { ex: 300 }); // output is string
    res.status(200).json({ message: "Stored successfully" });
  } catch (error) {
    console.error("Error storing response in Redis:", error);
    res.status(500).json({ error: "Failed to store response" });
  }
}
