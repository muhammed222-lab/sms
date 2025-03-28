/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const token = process.env.FIVESIM_API_KEY;

  if (!token) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    let url = `https://5sim.net/v1/`;

    switch (action) {
      case "limits":
        url += `guest/products/${searchParams.get("country") || "any"}/${
          searchParams.get("operator") || "any"
        }`;
        break;
      case "buy":
        url += `user/buy/activation/${searchParams.get(
          "country"
        )}/${searchParams.get("operator")}/${searchParams.get("product")}`;
        break;
      case "orders":
        url += `user/orders?category=activation`;
        break;
      case "check":
        url += `user/check/${searchParams.get("orderId")}`;
        break;
      case "finish":
        url += `user/finish/${searchParams.get("orderId")}`;
        break;
      case "cancel":
        url += `user/cancel/${searchParams.get("orderId")}`;
        break;
      case "ban":
        url += `user/ban/${searchParams.get("orderId")}`;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // For non-OK responses, read text and return an error message.
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If parsing fails, read the raw text and return as error detail.
      const text = await response.text();
      return NextResponse.json(
        {
          error: "API returned non-JSON response",
          details: text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
