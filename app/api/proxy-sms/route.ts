/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/proxy-sms/route.ts
// app/api/proxy-sms/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://5sim.net/v1";

export async function GET(request: Request) {
  const apiKey = process.env.NEXT_PUBLIC_FIVESIM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "5SIM API key is not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (!action) {
    return NextResponse.json(
      { error: "Action parameter is required" },
      { status: 400 }
    );
  }

  try {
    let url = "";
    let params = new URLSearchParams();

    switch (action) {
      case "get-countries":
        url = `${BASE_URL}/guest/countries`;
        break;

      case "get-prices":
        url = `${BASE_URL}/guest/prices`;
        const country = searchParams.get("country");
        const product = searchParams.get("product");
        if (country) params.append("country", country);
        if (product) params.append("product", product);
        break;

      case "buy-activation": {
        const buyCountry = searchParams.get("country");
        const buyOperator = searchParams.get("operator") || "any";
        const buyProduct = searchParams.get("product");
        if (!buyCountry || !buyProduct) {
          return NextResponse.json(
            { error: "Country and product are required" },
            { status: 400 }
          );
        }
        url = `${BASE_URL}/user/buy/activation/${encodeURIComponent(
          buyCountry
        )}/${encodeURIComponent(buyOperator)}/${encodeURIComponent(
          buyProduct
        )}`;
        break;
      }

      case "check-order": {
        const orderId = searchParams.get("order_id");
        if (!orderId) {
          return NextResponse.json(
            { error: "Order ID is required" },
            { status: 400 }
          );
        }
        url = `${BASE_URL}/user/check/${encodeURIComponent(orderId)}`;
        break;
      }

      case "cancel-order": {
        const cancelOrderId = searchParams.get("order_id");
        if (!cancelOrderId) {
          return NextResponse.json(
            { error: "Order ID is required" },
            { status: 400 }
          );
        }
        url = `${BASE_URL}/user/cancel/${encodeURIComponent(cancelOrderId)}`;
        break;
      }

      case "reuse-number": {
        const reuseProduct = searchParams.get("product");
        const reuseNumber = searchParams.get("number");
        if (!reuseProduct || !reuseNumber) {
          return NextResponse.json(
            { error: "Product and number are required" },
            { status: 400 }
          );
        }
        url = `${BASE_URL}/user/reuse/${encodeURIComponent(
          reuseProduct
        )}/${encodeURIComponent(reuseNumber.replace("+", ""))}`;
        break;
      }

      case "get-profile":
        url = `${BASE_URL}/user/profile`;
        break;

      case "get-orders": {
        url = `${BASE_URL}/user/orders`;
        const category = searchParams.get("category") || "activation";
        params.append("category", category);
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    console.log("Proxying to:", fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // Clone the response to read text for logging, then send error details.
      const responseClone = response.clone();
      let errorDetails;
      try {
        errorDetails = await responseClone.text();
      } catch (e) {
        errorDetails = "Could not read error response";
      }
      console.error(`API Error ${response.status}:`, errorDetails);
      return NextResponse.json(
        {
          error: `API request failed with status ${response.status}`,
          details: errorDetails,
        },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (e: any) {
      console.error("Failed to parse JSON response:", e);
      return NextResponse.json(
        { error: "Invalid JSON response from API" },
        { status: 500 }
      );
    }

    // Format specific responses if needed
    switch (action) {
      case "get-countries": {
        const countries = Object.entries(data).map(
          ([name, details]: [string, any]) => ({
            name,
            iso: details.iso ? Object.keys(details.iso)[0] : "",
            prefix: details.prefix ? Object.keys(details.prefix)[0] : "",
            text_en: details.text_en || name,
            text_ru: details.text_ru || name,
          })
        );
        return NextResponse.json(countries);
      }
      case "get-prices": {
        const formattedPrices: Record<string, any> = {};
        for (const [countryName, products] of Object.entries(data)) {
          formattedPrices[countryName] = {};
          for (const [productName, operators] of Object.entries(
            products as any
          )) {
            formattedPrices[countryName][productName] = {};
            for (const [operator, details] of Object.entries(
              operators as any
            )) {
              formattedPrices[countryName][productName][operator] = {
                ...(typeof details === "object" && details !== null
                  ? details
                  : {}),
                cost_usd: ((details as any).cost * 0.012).toFixed(2),
              };
            }
          }
        }
        return NextResponse.json(formattedPrices);
      }
      default:
        return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
