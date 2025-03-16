/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const SERVICES_URL = "https://5sim.net/v1/guest/prices"; // Adjust if needed

const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
  };
  return headers;
};

export async function GET(req: Request) {
  try {
    const response = await fetch(SERVICES_URL, { headers: getHeaders() });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch services" },
        { status: response.status }
      );
    }
    const rawData = await response.json();
    // Transform rawData from:
    // { country: { operator: { product: { cost, count, rate } } } }
    // into a flat array of service objects:
    // { title, id, price: cost, stock: count }
    const servicesArray: Array<{
      title: string;
      id: string;
      price: number;
      stock: number;
      rate: number;
    }> = [];
    for (const country in rawData) {
      const operatorData = rawData[country];
      for (const operator in operatorData) {
        const products = operatorData[operator];
        for (const product in products) {
          const productData = products[product]; // { cost, count, rate }
          servicesArray.push({
            title: `${product} (${operator}) [${country}]`,
            id: `${country}-${operator}-${product}`,
            price: productData.cost,
            stock: productData.count,
            rate: productData.rate,
          });
        }
      }
    }
    return NextResponse.json(servicesArray);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
