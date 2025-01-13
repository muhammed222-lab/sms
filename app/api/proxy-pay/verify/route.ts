import { NextResponse } from "next/server";
const Flutterwave = require("flutterwave-node-v3");

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

export async function POST(request: Request) {
  try {
    const { account_number, account_bank } = await request.json();

    if (!account_number || !account_bank) {
      return NextResponse.json({
        status: "error",
        message: "Missing account number or bank code.",
      });
    }

    console.log("Account Number:", account_number);
    console.log("Bank Code:", account_bank);

    // Verify the account using Flutterwave SDK
    const response = await flw.Misc.verify_Account({
      account_number,
      account_bank,
    });

    if (response.status === "success") {
      return NextResponse.json({
        status: "success",
        data: response.data,
      });
    }

    return NextResponse.json({
      status: "error",
      message: response.message || "Verification failed",
    });
  } catch (error) {
    console.error("Error in /api/proxy-pay/verify:", error);
    return NextResponse.json({
      status: "error",
      message: "Failed to verify account",
    });
  }
}
