import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "your_mongo_connection_string";

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env.local"
  );
}

let client;

export default async function dbConnect() {
  if (client) return client;

  try {
    client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    return client;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw new Error("Database connection failed");
  }
}
