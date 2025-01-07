import dbConnect from "./app/utils/db.js";

async function testConnection() {
  try {
    await dbConnect(); // Call the dbConnect function
    console.log("MongoDB connection tested successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

testConnection();
