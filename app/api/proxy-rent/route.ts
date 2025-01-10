import { NextResponse } from "next/server";

interface LimitItem {
  country_id: string;
  count: string;
  cost: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const action = searchParams.get("action");
  const country_id = searchParams.get("country_id");
  const type = searchParams.get("type");
  const time = searchParams.get("time");
  const request_id = searchParams.get("request_id");
  const status = searchParams.get("status");

  if (!action) {
    return NextResponse.json(
      { error: "The 'action' parameter is required." },
      { status: 400 }
    );
  }

  const rentApiKey = "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm";
  if (!rentApiKey) {
    return NextResponse.json(
      { error: "Rent API Key is missing." },
      { status: 500 }
    );
  }

  let apiUrl;
  if (action === "get-countries") {
    apiUrl = `https://api.sms-man.com/rent-api/limits?token=${rentApiKey}&type=hour&time=1`;
  } else {
    apiUrl = `https://api.sms-man.com/rent-api/${action}?token=${rentApiKey}`;
    if (country_id) apiUrl += `&country_id=${country_id}`;
    if (type) apiUrl += `&type=${type}`;
    if (time) apiUrl += `&time=${time}`;
    if (request_id) apiUrl += `&request_id=${request_id}`;
    if (status) apiUrl += `&status=${status}`;
  }

  try {
    console.log("Constructed API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMsg = "An error occurred while processing your request.";
      try {
        const errorData = JSON.parse(responseText);
        errorMsg = errorData.error_msg || errorMsg;
      } catch {
        errorMsg = responseText;
      }
      console.error("Error Response from API:", errorMsg);
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);

    // Special case for `get-countries`
    if (action === "get-countries") {
      const countries =
        data.limits?.length > 0
          ? data.limits.map((item: LimitItem) => ({
              id: item.country_id,
              name: `Country ${item.country_id}`,
              count: item.count,
              cost: item.cost,
            }))
          : [
              { id: "0", name: "Default Country", count: "0", cost: "0.00" }, // Fallback
            ];
      return NextResponse.json(countries, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in proxy-rent API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
