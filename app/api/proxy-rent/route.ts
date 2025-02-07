import { NextResponse } from "next/server";

// Replace with your SMS-Man API key
import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Replace with your SMS-Man API key
const RENT_API_KEY = process.env.RENT_API_KEY;

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

  let apiUrl;
  switch (action) {
    case "get-balance":
      apiUrl = `https://api.sms-man.com/rent-api/get-balance?token=${RENT_API_KEY}`;
      break;
    case "limits":
      apiUrl = `https://api.sms-man.com/rent-api/limits?token=${RENT_API_KEY}`;
      if (country_id) apiUrl += `&country_id=${country_id}`;
      if (type) apiUrl += `&type=${type}`;
      if (time) apiUrl += `&time=${time}`;
      break;
    case "get-number":
      apiUrl = `https://api.sms-man.com/rent-api/get-number?token=${RENT_API_KEY}`;
      if (country_id) apiUrl += `&country_id=${country_id}`;
      if (type) apiUrl += `&type=${type}`;
      if (time) apiUrl += `&time=${time}`;
      break;
    case "set-status":
      apiUrl = `https://api.sms-man.com/rent-api/set-status?token=${RENT_API_KEY}`;
      if (request_id) apiUrl += `&request_id=${request_id}`;
      if (status) apiUrl += `&status=${status}`;
      break;
    case "get-sms":
      apiUrl = `https://api.sms-man.com/rent-api/get-sms?token=${RENT_API_KEY}`;
      if (request_id) apiUrl += `&request_id=${request_id}`;
      break;
    case "get-all-sms":
      apiUrl = `https://api.sms-man.com/rent-api/get-all-sms?token=${RENT_API_KEY}`;
      if (request_id) apiUrl += `&request_id=${request_id}`;
      break;
    case "get-all-requests":
      apiUrl = `https://api.sms-man.com/rent-api/get-all-requests?token=${RENT_API_KEY}`;
      break;
    default:
      return NextResponse.json(
        { error: "Invalid action parameter." },
        { status: 400 }
      );
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
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in proxy-rent API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
