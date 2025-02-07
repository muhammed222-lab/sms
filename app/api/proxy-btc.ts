import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const API_KEY = process.env.CRYPTOMUS_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed." });
  }

  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
      return res
        .status(400)
        .json({ error: "Amount and currency are required." });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a valid positive number." });
    }

    const order_id = crypto.randomBytes(12).toString("hex");
    const data = {
      amount: parsedAmount.toFixed(2),
      currency,
      order_id,
      url_success: "https://yourdomain.com/success",
      url_callback: "https://your-ngrok-url/callback",
    };

    const dataBase64 = Buffer.from(JSON.stringify(data)).toString("base64");
    const sign = crypto
      .createHash("md5")
      .update(dataBase64 + API_KEY)
      .digest("hex");

    const headers = { merchant: MERCHANT_ID, sign };
    const response = await axios.post(
      "https://api.cryptomus.com/v1/payment",
      data,
      { headers }
    );

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error creating invoice:", error);

    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({ error: "An unexpected error occurred." });
  }
}
