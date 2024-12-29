import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req, res) {
  const { method, query } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { email } = query;

        if (!email) {
          return res
            .status(400)
            .json({ success: false, error: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
          return res
            .status(404)
            .json({ success: false, error: "User not found" });
        }

        res.status(200).json({
          success: true,
          data: { country: user.country, currency: user.currency },
        });
      } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
