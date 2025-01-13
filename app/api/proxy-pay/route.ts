import { NextResponse } from "next/server";
import Flutterwave from "flutterwave-node-v3";

// Initialize Flutterwave SDK
const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY || ""; // Replace with your public key
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || ""; // Replace with your secret key
const flw = new Flutterwave(FLW_PUBLIC_KEY, FLW_SECRET_KEY);

export async function POST(request: Request) {
  const url = new URL(request.url);

  // Fetch list of banks
  if (url.pathname.includes("/banks")) {
    try {
      const { query } = await request.json();

      const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        // Filter banks based on user input query
        const filteredBanks = data.data.filter((bank: { name: string }) =>
          bank.name.toLowerCase().includes(query.toLowerCase())
        );

        return NextResponse.json({
          status: "success",
          banks: filteredBanks,
        });
      }

      return NextResponse.json({ status: "error", message: data.message });
    } catch (error) {
      return NextResponse.json({
        status: "error",
        message: "Failed to fetch banks",
      });
    }
  }

  // Verify account using Flutterwave SDK
  if (url.pathname.includes("/verify")) {
    try {
      const { account_number, account_bank } = await request.json();

      if (!account_number || !account_bank) {
        return NextResponse.json({
          status: "error",
          message: "Missing account number or bank name.",
        });
      }

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
        message: response.message,
      });
    } catch (error) {
      console.error("Error in /verify route:", error);
      return NextResponse.json({
        status: "error",
        message: "Failed to verify account",
      });
    }
  }

  // Withdraw funds using Flutterwave SDK
  if (url.pathname.includes("/withdraw")) {
    try {
      const {
        account_bank,
        account_number,
        amount,
        narration = "Commission withdrawal",
      } = await request.json();

      if (!account_bank || !account_number || !amount) {
        return NextResponse.json({
          status: "error",
          message: "Missing bank, account number, or amount.",
        });
      }

      // Use the Flutterwave SDK to initiate the transfer
      const response = await flw.Transfer.initiate({
        account_bank,
        account_number,
        amount,
        narration,
        currency: "NGN",
        reference: `TX-${Date.now()}`, // Unique reference
      });

      if (response.status === "success") {
        return NextResponse.json({
          status: "success",
          data: response.data,
        });
      }

      return NextResponse.json({
        status: "error",
        message: response.message || "Withdrawal failed.",
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      return NextResponse.json({
        status: "error",
        message: "Failed to process withdrawal",
      });
    }
  }

  return NextResponse.json({ status: "error", message: "Invalid request" });
}
