/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const VENDOR_PAYMENTS_URL = "https://5sim.net/v1/vendor/payments";
const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
  };
  return headers;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlObj = new URL(VENDOR_PAYMENTS_URL);
    searchParams.forEach((value, key) => {
      urlObj.searchParams.append(key, value);
    });
    const response = await fetch(urlObj.toString(), { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vendor payments" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
