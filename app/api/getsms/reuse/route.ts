import { NextResponse } from "next/server";

const REUSE_URL = "https://5sim.net/v1/user/reuse";
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
    const { searchParams } = new URL(req.url);
    const product = searchParams.get("product");
    const number = searchParams.get("number");
    if (!product || !number) {
      return NextResponse.json(
        { error: "Missing product or number" },
        { status: 400 }
      );
    }
    const url = `${REUSE_URL}/${product}/${number}`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to reuse number" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
