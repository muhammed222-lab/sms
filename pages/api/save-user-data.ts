import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, name, balance } = req.body;

  try {
    // Example: Save to database (adjust according to your DB setup)
    // await db.collection('users').insertOne({ email, name, balance });

    res.status(200).json({ message: "User data saved successfully", balance });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ message: "Failed to save user data" });
  }
}
