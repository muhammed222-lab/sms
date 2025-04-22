import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const product = searchParams.get("product");
    const number = searchParams.get("number");

    if (!product || !number) {
      return NextResponse.json(
        { error: "Product name and phone number are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIVESIM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://5sim.net/v1/user/reuse/${product}/${number}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = "Failed to rebuy number";

      // Handle specific error cases
      if (response.status === 400) {
        if (errorData.error === "reuse not possible") {
          errorMessage = "This number is not available for reusing";
        } else if (errorData.error === "reuse false") {
          errorMessage = "Reusing this number is not allowed";
        } else if (errorData.error === "reuse expired") {
          errorMessage = "The reuse period for this number has expired";
        } else if (errorData.error === "not enough user balance") {
          errorMessage = "Insufficient balance to rebuy this number";
        } else if (errorData.error === "no free phones") {
          errorMessage = "No available numbers for this service";
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in reuse endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
