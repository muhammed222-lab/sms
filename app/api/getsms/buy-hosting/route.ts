import { NextResponse } from "next/server";

const BUY_HOSTING_URL = "https://5sim.net/v1/user/buy/hosting";
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
    const country = searchParams.get("country");
    const operator = searchParams.get("operator");
    const product = searchParams.get("product");
    if (!country || !operator || !product) {
      return NextResponse.json(
        { error: "Missing country, operator, or product" },
        { status: 400 }
      );
    }
    const url = `${BUY_HOSTING_URL}/${country}/${operator}/${product}`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to purchase hosting number" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
