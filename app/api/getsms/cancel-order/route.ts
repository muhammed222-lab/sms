/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`[5SIM] Canceling order ${id}`);

    const response = await fetch(`https://5sim.net/v1/user/cancel/${id}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
      },
    });

    // Clone response before reading
    const responseClone = response.clone();

    try {
      const data = await response.json();

      // Successful cancellation
      if (response.ok && data.status === "CANCELED") {
        return NextResponse.json(data);
      }

      // Handle API-specific errors
      return NextResponse.json(
        { error: data.error || "Failed to cancel order" },
        { status: response.status }
      );
    } catch (jsonError) {
      // Fallback to text if JSON parsing fails
      const text = await responseClone.text();

      // Special case for "order not found"
      if (text.includes("Order is cancelled already")) {
        return NextResponse.json(
          {
            error: "Order not found in API (but may exist in dashboard)",
            details: text,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: text || "Unknown API error" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("[5SIM] Network error:", error);
    return NextResponse.json(
      { error: "Failed to connect to 5SIM" },
      { status: 500 }
    );
  }
}
