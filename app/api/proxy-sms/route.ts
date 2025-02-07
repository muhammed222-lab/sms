import { NextResponse } from "next/server";

import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Replace with your SMS-Man API key
const smsApiKey = process.env.RENT_API_KEY;

// Function to fetch SMS-Man balance
const checkSmsManBalance = async (smsApiKey: string) => {
  const response = await fetch(
    `https://api.sms-man.com/control/get-balance?token=${smsApiKey}`
  );

  const data = await response.json();
  return data.balance; // Return the balance from SMS-Man API
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const country_id = searchParams.get("country_id");
  const application_id = searchParams.get("application_id");
  const request_id = searchParams.get("request_id");
  const status = searchParams.get("status");

  // const smsApiKey = process.env.RENT_API_KEY;

  if (!smsApiKey) {
    console.error("SMS API Key is missing.");
    return NextResponse.json(
      { error: "SMS API Key is missing." },
      { status: 500 }
    );
  }

  // If action is 'get-balance', return the balance from SMS-Man
  if (action === "get-balance") {
    try {
      const balance = await checkSmsManBalance(smsApiKey);
      return NextResponse.json({ balance }, { status: 200 });
    } catch (error) {
      console.error("Error fetching SMS-Man balance:", error);
      return NextResponse.json(
        { error: "Error fetching SMS-Man balance." },
        { status: 500 }
      );
    }
  }

  // Build the API URL dynamically based on the requested action
  let apiUrl = `https://api.sms-man.com/control/${action}?token=${smsApiKey}`;
  if (country_id) apiUrl += `&country_id=${country_id}`;
  if (application_id) apiUrl += `&application_id=${application_id}`;
  if (request_id) apiUrl += `&request_id=${request_id}`;
  if (status) apiUrl += `&status=${status}`;

  try {
    console.log(`Making request to SMS-Man API: ${apiUrl}`);

    // Fetch data from the SMS-Man API
    const response = await fetch(apiUrl, { method: "GET" });
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      console.error(`Error response from SMS API: Status ${response.status}`);
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        return NextResponse.json(
          { error: errorData.error_msg },
          { status: response.status }
        );
      } else {
        const errorText = await response.text();
        console.error("Error text:", errorText);
        return NextResponse.json(
          { error: "Unexpected error from SMS API." },
          { status: response.status }
        );
      }
    }

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      console.log("Successful response from SMS API:", data);
      return NextResponse.json(data, { status: 200 });
    } else {
      const textData = await response.text();
      console.error("Unexpected text response:", textData);
      return NextResponse.json(
        { error: "Unexpected response from SMS API." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in proxy handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
