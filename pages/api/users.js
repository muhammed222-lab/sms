import dbConnect from "../../app/utils/db";
import User from "../../app/models/User";

export default async function handler(req, res) {
  try {
    await dbConnect();

    // Example: Fetch all users from the database
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
