import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      const body = req.body; // req.body is already parsed as JSON in Next.js Pages Router
      const response = await fetch(process.env.CHATBOT_WEBHOOK as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`External API returned status: ${response.status}`);
      }
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error proxying request to n8n:", error);
      res.status(500).json({ error: "Failed to connect to chatbot service" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
