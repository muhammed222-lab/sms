import { NextResponse } from "next/server";

// Environment variables
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || "";

export async function POST(request: Request) {
  try {
    // Parse the incoming request payload
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({
        status: "error",
        message: "Missing transaction ID.",
      });
    }

    console.log("Verifying transaction with ID:", transactionId);

    // Make the API request to verify the transaction
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status === "success") {
      console.log("Transaction verification successful:", data.data);
      return NextResponse.json({
        status: "success",
        data: data.data,
      });
    } else {
      console.error("Transaction verification failed:", data.message);
      return NextResponse.json({
        status: "error",
        message: data.message || "Transaction verification failed.",
      });
    }
  } catch (error: unknown) {
    // Handle error safely by narrowing the type
    if (error instanceof Error) {
      console.error("Error verifying transaction:", error.message);
      return NextResponse.json({
        status: "error",
        message: error.message || "Failed to verify transaction.",
      });
    } else {
      console.error("Error verifying transaction:", error);
      return NextResponse.json({
        status: "error",
        message: "Failed to verify transaction.",
      });
    }
  }
}
