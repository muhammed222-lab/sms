import { NextResponse } from "next/server";

// Replace with your SMS-Man API key

import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Replace with your SMS-Man API key
const RENT_API_KEY = process.env.RENT_API_KEY;

export async function GET() {
  // API logic remains unchanged
  try {
    // Verify that the API key is set
    if (!RENT_API_KEY) {
      return NextResponse.json(
        { error: "API key is not set in the environment." },
        { status: 500 }
      );
    }

    // Call the SMS-Man API to get the balance
    const response = await fetch(
      `https://api.sms-man.com/rent-api/get-balance?token=${RENT_API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch balance." },
        { status: response.status }
      );
    }

    // Parse and return the balance data
    const balanceData = await response.json();
    return NextResponse.json(balanceData, { status: 200 });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching the balance." },
      { status: 500 }
    );
  }
}
