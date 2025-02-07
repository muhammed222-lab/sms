import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const API_KEY = process.env.CRYPTOMUS_API_KEY;

if (!MERCHANT_ID || !API_KEY) {
  throw new Error("Missing CRYPTOMUS_MERCHANT_ID or CRYPTOMUS_API_KEY.");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    const { amount, currency } = body;
    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Amount and currency are required." },
        { status: 400 }
      );
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a valid positive number." },
        { status: 400 }
      );
    }

    const order_id = crypto.randomBytes(12).toString("hex");
    const data = {
      amount: parsedAmount.toFixed(2),
      currency,
      order_id,
      url_success: "https://smsglobe.net/success",
      url_callback: "https://smsglobe.net/api/payment-callback",
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

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error creating invoice:", error);

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
//     const exchangeRate = data.rates.NGN;
