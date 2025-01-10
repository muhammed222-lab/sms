import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const country_id = searchParams.get("country_id");
  const application_id = searchParams.get("application_id");
  const request_id = searchParams.get("request_id");
  const status = searchParams.get("status");

  // Check if the SMS API key exists
  const smsApiKey = "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm";
  if (!smsApiKey) {
    console.error("SMS API Key is missing.");
    return NextResponse.json(
      { error: "SMS API Key is missing." },
      { status: 500 }
    );
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
