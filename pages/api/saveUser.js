import { MongoClient } from "mongodb";

// MongoDB connection string
const client = new MongoClient(
  "mongodb+srv://muhammed:H5PucHJ2NogD1Bzj@deemx.y6y3g.mongodb.net/?retryWrites=true&w=majority&appName=deemx"
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Connect to MongoDB
      await client.connect();
      const db = client.db("deem");
      const usersCollection = db.collection("users");

      // Extract user data from the request body
      const { email, firstName, balance } = req.body;

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Save user to the database
      const result = await usersCollection.insertOne({
        email,
        firstName,
        balance,
        createdAt: new Date(),
      });

      // Send success response
      res.status(200).json({
        message: "User saved successfully",
        userId: result.insertedId,
      });
    } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).json({ message: "Error saving user data" });
    } finally {
      await client.close();
    }
  } else {
    // Method not allowed
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
