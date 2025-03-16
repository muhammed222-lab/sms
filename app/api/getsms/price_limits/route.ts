/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const PRICE_LIMITS_URL = "https://5sim.net/v1/guest/price_limits";
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
    const response = await fetch(PRICE_LIMITS_URL, { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch price limits" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const createData = await req.json();
    const response = await fetch(PRICE_LIMITS_URL, {
      method: "POST",
      headers: getHeaders("application/json"),
      body: JSON.stringify(createData),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create price limit" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updateData = await req.json();
    const response = await fetch(`${PRICE_LIMITS_URL}/${updateData.id}`, {
      method: "PUT",
      headers: getHeaders("application/json"),
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to update price limit" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const response = await fetch(`${PRICE_LIMITS_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete price limit" },
        { status: response.status }
      );
    }
    return NextResponse.json({ message: "Price limit deleted successfully" });
  } catch {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
