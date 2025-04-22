// app/api/proxy-buy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const operator = searchParams.get("operator");
  const product = searchParams.get("product");

  if (!country || !operator || !product) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    // First check if there are free numbers available for this combination
    const pricesResponse = await fetch(
      `https://5sim.net/v1/guest/prices?country=${country}&product=${product}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!pricesResponse.ok) {
      throw new Error(`Failed to check prices: ${pricesResponse.status}`);
    }

    const pricesData = await pricesResponse.json();

    // Check if this specific operator has free numbers (cost = 0)
    const operatorData = pricesData[country]?.[product]?.[operator];
    if (!operatorData || operatorData.cost > 0) {
      return NextResponse.json(
        { error: "No free numbers available for this selection" },
        { status: 400 }
      );
    }

    // If we get here, there should be free numbers available
    const response = await fetch(
      `https://5sim.net/v1/user/buy/activation/${country}/${operator}/${product}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.message === "no free phones") {
        return NextResponse.json(
          { error: "No free numbers available right now" },
          { status: 400 }
        );
      }
      throw new Error(
        `API request failed: ${errorData.message || response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get number",
      },
      { status: 500 }
    );
  }
}
