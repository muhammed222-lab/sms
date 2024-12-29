import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://muhammed:H5PucHJ2NogD1Bzj@deemx.y6y3g.mongodb.net/?retryWrites=true&w=majority&appName=deemx";

let isConnected = false; // Track connection state

const dbConnect = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default dbConnect;
