import { NextResponse } from "next/server";
const Flutterwave = require("flutterwave-node-v3");

// Initialize Flutterwave SDK with your keys
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

export async function POST(request: Request) {
  try {
    const {
      account_bank,
      account_number,
      amount,
      narration = "Commission withdrawal",
    } = await request.json();

    // Validate required fields
    if (!account_bank || !account_number || !amount) {
      return NextResponse.json({
        status: "error",
        message:
          "Missing required fields: bank code, account number, or amount.",
      });
    }

    // Call the Flutterwave Transfer API
    const payload = {
      account_bank,
      account_number,
      amount,
      narration,
      currency: "NGN", // Assuming NGN for Nigerian banks
      reference: `TX-${Date.now()}`, // Unique transaction reference
    };

    const response = await flw.Transfer.initiate(payload);

    if (response.status === "success") {
      return NextResponse.json({
        status: "success",
        message: "Withdrawal successful.",
        data: response.data,
      });
    } else {
      return NextResponse.json({
        status: "error",
        message: response.message || "Failed to process withdrawal.",
      });
    }
  } catch (error) {
    console.error("Error processing withdrawal:", error);

    return NextResponse.json({
      status: "error",
      message: "An error occurred while processing the withdrawal.",
    });
  }
}
