// pages/api/saveUserData.ts
import { NextApiRequest, NextApiResponse } from "next";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { email, name, balance, generatedNumber } = req.body;

      // Ensure that required data is available
      if (!email || !name || !balance || !generatedNumber) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Connect to MongoDB
      await client.connect();
      const db = client.db("your-database-name");
      const usersCollection = db.collection("users");

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        // Update existing user data if needed
        await usersCollection.updateOne(
          { email },
          { $set: { name, balance, generatedNumber } }
        );
      } else {
        // Insert a new user document
        await usersCollection.insertOne({
          email,
          name,
          balance,
          generatedNumber,
        });
      }

      res.status(200).json({ message: "User data saved successfully" });
    } catch (error) {
      console.error("Error saving user data:", error);
      res.status(500).json({ message: "Error saving user data" });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};
