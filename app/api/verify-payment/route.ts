import { NextResponse } from "next/server";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const API_KEY = process.env.CRYPTOMUS_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const data = { order_id };
    const dataBase64 = Buffer.from(JSON.stringify(data)).toString("base64");
    const sign = crypto
      .createHash("md5")
      .update(dataBase64 + API_KEY)
      .digest("hex");

    const headers = { merchant: MERCHANT_ID, sign };
    const response = await axios.post(
      "https://api.cryptomus.com/v1/payment/info",
      data,
      { headers }
    );

    return NextResponse.json({
      success: true,
      result: response.data.result,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
