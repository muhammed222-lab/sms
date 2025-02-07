import { NextResponse } from "next/server";

// Load API token securely from environment variables
// const SMS_MAN_API_TOKEN = "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm";
import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

// Replace with your SMS-Man API key
const SMS_MAN_API_TOKEN = process.env.RENT_API_KEY;

if (!SMS_MAN_API_TOKEN) {
  throw new Error(
    "API token is not defined. Please set SMS_MAN_API_TOKEN in your .env.local."
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  // Extract query params to identify the type of data to fetch
  const type = url.searchParams.get("type");
  const countryId = url.searchParams.get("country_id"); // Optional parameter for country-specific data
  const applicationId = url.searchParams.get("application_id"); // Optional for service-specific prices

  // Validate if the 'type' query parameter is valid
  if (!type || !["services", "countries", "prices"].includes(type)) {
    return NextResponse.json({
      status: "error",
      message:
        "Invalid 'type' parameter. Allowed values are: services, countries, prices.",
    });
  }

  let endpoint = "";

  // Construct the endpoint URL based on the query parameter type
  if (type === "services") {
    endpoint = `https://api.sms-man.com/stubs/handler_api.php?action=getServices&api_key=${SMS_MAN_API_TOKEN}`;
  } else if (type === "countries") {
    endpoint = `https://api.sms-man.com/stubs/handler_api.php?action=getCountries&api_key=${SMS_MAN_API_TOKEN}`;
  } else if (type === "prices") {
    if (!countryId || !applicationId) {
      return NextResponse.json({
        status: "error",
        message: "Missing required parameters: country_id and application_id.",
      });
    }

    // Correct prices endpoint
    endpoint = `https://api.sms-man.com/stubs/handler_api.php?action=getPrices&api_key=${SMS_MAN_API_TOKEN}&country=${countryId}&service=${applicationId}`;
  }

  try {
    // Fetch data from the constructed endpoint
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Failed to fetch data from SMS API.");
    }

    const data = await response.json();

    // Return success response
    return NextResponse.json({ status: "success", data });
  } catch (error) {
    console.error("Error fetching data:", error);

    return NextResponse.json({
      status: "error",
      message: (error as Error).message || "Failed to fetch data.",
    });
  }
}
