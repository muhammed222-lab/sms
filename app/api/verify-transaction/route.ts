import { NextResponse } from "next/server";
import Flutterwave from "flutterwave-node-v3";

const flw = new Flutterwave(
  process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "",
  process.env.FLW_SECRET_KEY || ""
);

export async function POST(request: Request) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({
        status: "error",
        message: "Missing transaction ID.",
      });
    }

    const response = await flw.Transaction.verify({ id: transactionId });

    if (response.status === "success") {
      return NextResponse.json({
        status: "success",
        data: response.data,
      });
    } else {
      return NextResponse.json({
        status: "error",
        message: response.message || "Transaction verification failed.",
      });
    }
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return NextResponse.json({
      status: "error",
      message: "Failed to verify transaction.",
    });
  }
}
