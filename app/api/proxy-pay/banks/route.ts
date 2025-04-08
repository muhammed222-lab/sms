/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

export async function GET(request: Request) {
  try {
    const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        Accept: "application/json",
      },
    });
    const data = await response.json();
    console.log("Flutterwave response:", data);
    if (data.status === "success") {
      const banks = data.data.map((bank: { name: string; code: string }) => ({
        name: bank.name,
        code: bank.code,
      }));
      const res = NextResponse.json({ status: "success", banks });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    } else {
      const res = NextResponse.json({ status: "error", message: data.message });
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
    const res = NextResponse.json({
      status: "error",
      message: "Failed to fetch banks",
    });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}
