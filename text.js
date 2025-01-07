import { MongoClient } from "mongodb";

// Connection URI
const uri = "mongodb+srv://muhammed:H5PucHJ2NogD1Bzj@deemx.y6y3g.mongodb.net/";

// Create MongoDB client
const client = new MongoClient(uri, {
  tls: true, // Enable TLS
  serverApi: { version: "1" }, // Use stable API version
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB!");

    // Select the database and collection
    const database = client.db("deem"); // Use your database name
    const collection = database.collection("users"); // Replace 'users' with your collection name

    // Data to insert
    const user = {
      name: "Olayemi netrc",
      email: "muhammed.doe@example.com",
      age: 30,
      hobbies: ["reading", "coding", "traveling"],
    };

    // Insert the document
    const result = await collection.insertOne(user);
    console.log(`Document inserted with _id: ${result.insertedId}`);
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the function
run().catch(console.dir);
