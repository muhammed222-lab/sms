import { NextResponse } from "next/server";

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

export async function POST() {
  try {
    const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
      },
    });
    const data = await response.json();

    if (data.status === "success") {
      return NextResponse.json({
        status: "success",
        banks: data.data.map((bank: { name: string; code: string }) => ({
          name: bank.name,
          code: bank.code,
        })),
      });
    } else {
      return NextResponse.json({ status: "error", message: data.message });
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json({
      status: "error",
      message: "Failed to fetch banks",
    });
  }
}
