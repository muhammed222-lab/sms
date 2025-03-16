import { NextResponse } from "next/server";

const WITHDRAW_URL = "https://5sim.net/v1/vendor/withdraw";
const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
  };
  if (contentType) headers["Content-Type"] = contentType;
  return headers;
};

export async function POST(req: Request) {
  try {
    const payoutData = await req.json();
    const response = await fetch(WITHDRAW_URL, {
      method: "POST",
      headers: getHeaders("application/json"),
      body: JSON.stringify(payoutData),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create payout" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
