import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId if necessary
import dbConnect from "../../app/lib/dbConnect"; // Assuming you have dbConnect

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ message: "Email and amount are required" });
    }

    try {
      // Connect to the database
      await dbConnect();

      const client = new MongoClient(process.env.MONGO_URI!); // Ensure MongoClient is properly initialized
      const database = client.db("deem");
      const collection = database.collection("users");

      // Find the user by email
      const user = await collection.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate deposit amount
      if (amount <= 0) {
        return res
          .status(400)
          .json({ message: "Deposit amount must be greater than zero" });
      }

      // Update balance
      await collection.updateOne({ email }, { $inc: { balance: amount } });

      return res.status(200).json({
        message: "Deposit successful",
        user: {
          balance: user.balance + amount, // Updated balance
        },
      });
    } catch (error) {
      console.error("Error processing deposit:", error);
      return res
        .status(500)
        .json({ message: "An error occurred while processing the deposit" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
