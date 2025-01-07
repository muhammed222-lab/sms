// pages/api/getUserCountry.ts
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../app/models/User"; // Assuming you have a User model defined

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email } = req.query;

  if (req.method === "GET" && email) {
    try {
      const user = await User.findOne({ email });

      if (user) {
        return res.status(200).json({ country: user.country });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};

export default handler;
