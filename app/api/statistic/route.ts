/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

const API_URL = "https://5sim.net/v1/guest/prices";
const API_HEADERS = {
  Accept: "application/json",
};

export async function GET() {
  try {
    const response = await fetch(API_URL, { headers: API_HEADERS });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: response.status }
      );
    }
    const rawData = await response.json();
    // Transform rawData from:
    // { country: { operator: { product: { cost, count, rate } } } }
    // into:
    // { country: { "product (operator)": { cost, count, rate } } }
    const transformed: {
      [country: string]: {
        [key: string]: { cost: number; count: number; rate: number };
      };
    } = {};

    for (const country in rawData) {
      transformed[country] = {};
      const operatorData = rawData[country];
      for (const operator in operatorData) {
        const products = operatorData[operator];
        for (const product in products) {
          const productData = products[product]; // { cost, count, rate }
          const key = `${product} (${operator})`;
          transformed[country][key] = productData;
        }
      }
    }
    return NextResponse.json(transformed);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
