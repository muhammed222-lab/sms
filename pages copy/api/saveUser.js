import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, firstName, lastName, balance, generatedNumber } = req.body;

    // Ensure email is provided
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let client;
    try {
      // Replace with your MongoDB connection string
      client = await MongoClient.connect("mongodb://localhost:27017"); // Local MongoDB example
      const db = client.db("deemax"); // Replace with your actual database name
      const usersCollection = db.collection("users");

      // Insert user data into the "users" collection
      const result = await usersCollection.insertOne({
        email,
        firstName: firstName || "", // Save empty if not provided
        lastName: lastName || "", // Save empty if not provided
        balance,
        generatedNumber,
        createdAt: new Date(),
      });

      // Respond with a success message and the result
      res.status(201).json({ message: "User saved successfully", result });
    } catch (error) {
      console.error("Error saving user data:", error);
      res
        .status(500)
        .json({ message: "Error saving user data", error: error.message });
    } finally {
      if (client) {
        client.close(); // Close the MongoDB client connection
      }
    }
  } else {
    // Respond with an error if the request method is not POST
    res.status(405).json({ message: "Method not allowed" });
  }
}
