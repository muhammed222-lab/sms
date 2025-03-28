/* eslint-disable prefer-const */
// app/api/proxy-order-history/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIVESIM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const action = searchParams.get("action");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    let url = `https://5sim.net/v1/user/check/${orderId}`;
    let method = "GET";

    // Handle different actions
    if (action) {
      switch (action) {
        case "cancel":
          url = `https://5sim.net/v1/user/cancel/${orderId}`;
          break;
        case "finish":
          url = `https://5sim.net/v1/user/finish/${orderId}`;
          break;
        case "ban":
          url = `https://5sim.net/v1/user/ban/${orderId}`;
          break;
        case "reuse":
          const product = searchParams.get("product");
          const number = searchParams.get("number");
          if (!product || !number) {
            return NextResponse.json(
              { error: "Product and number are required for reuse" },
              { status: 400 }
            );
          }
          url = `https://5sim.net/v1/user/reuse/${product}/${number}`;
          break;
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to perform action" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
