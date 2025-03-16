/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const COUNTRIES_URL = "https://5sim.net/v1/guest/countries";
const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
  };
  return headers;
};

export async function GET(req: Request) {
  try {
    const response = await fetch(COUNTRIES_URL, { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch countries" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
