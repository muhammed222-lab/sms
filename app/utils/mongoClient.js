// utils/mongoClient.js
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://muhammed:@muhammed@deemx.y6y3g.mongodb.net/?retryWrites=true&w=majority&appName=deemx";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    if (!client.isConnected) {
      await client.connect();
      console.log("Connected to MongoDB!");
    }
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

module.exports = { connectToDatabase };
