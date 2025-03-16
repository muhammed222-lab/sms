/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const CHECK_ORDER_URL = "https://5sim.net/v1/user/check";
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
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const url = `${CHECK_ORDER_URL}/${id}`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to check order" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
