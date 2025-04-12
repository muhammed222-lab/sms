/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FIVESIM_API_KEY;

  try {
    // Check for available numbers (using guest endpoint)
    const response = await fetch("https://5sim.net/v1/guest/products/any/any", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch numbers");
    }

    const data = await response.json();

    // Filter for potentially free/low-cost numbers
    const freeNumbers = Object.entries(data)
      .filter(([product, details]: [string, any]) => {
        const typedDetails = details as { Price: number; Category: string };
        return typedDetails.Price <= 1; // Adjust threshold as needed
      })
      .map(([product, details]) => {
        const typedDetails = details as { Price: number; Category: string };
        return {
          product,
          price: typedDetails.Price,
          country: "any",
          operator: "any",
          category: typedDetails.Category,
        };
      });

    return NextResponse.json({
      success: true,
      numbers: freeNumbers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        numbers: [],
      },
      { status: 500 }
    );
  }
}
