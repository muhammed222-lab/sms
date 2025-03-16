/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const MAX_PRICES_URL = "https://5sim.net/v1/user/max-prices";
const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
};

export async function GET(req: Request) {
  try {
    const response = await fetch(MAX_PRICES_URL, { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch max prices" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
