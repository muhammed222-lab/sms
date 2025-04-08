// import { NextResponse } from "next/server";

// const BUY_ACTIVATION_URL = "https://5sim.net/v1/user/buy/activation";
// const getHeaders = (contentType?: string) => {
//   const headers: Record<string, string> = {
//     Accept: "application/json",
//     Authorization: ``,
//   };
//   if (contentType) headers["Content-Type"] = contentType;
//   return headers;
// };

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const country = searchParams.get("country");
//     const operator = searchParams.get("operator");
//     const product = searchParams.get("product");
//     if (!country || !operator || !product) {
//       return NextResponse.json(
//         { error: "Missing country, operator, or product" },
//         { status: 400 }
//       );
//     }

//     // Extract product code if product is in the format "usa-facebook-virtual51"
//     const parts = product.split("-");
//     const finalProduct = parts.length >= 2 ? parts[1] : product;

//     const url = `${BUY_ACTIVATION_URL}/${country}/${operator}/${finalProduct}`;
//     const response = await fetch(url, { headers: getHeaders() });
//     if (!response.ok) {
//       return NextResponse.json(
//         { error: "Failed to purchase activation number" },
//         { status: response.status }
//       );
//     }
//     const data = await response.json();
//     // Map phone to number for frontend compatibility
//     if (data.phone) {
//       data.number = data.phone;
//     }
//     return NextResponse.json(data);
//   } catch {
//     return NextResponse.json({ error: "An error occurred" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";

const BUY_ACTIVATION_URL = "https://5sim.net/v1/user/buy/activation";

const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: ``,
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

    const parts = product.split("-");
    const finalProduct = parts.length >= 2 ? parts[1] : product;

    const url = `${BUY_ACTIVATION_URL}/${country}/${operator}/${finalProduct}`;
    console.log("Sending Request to:", url);

    const response = await fetch(url, { headers: getHeaders() });
    const data = await response.json();
    console.log("Raw API Response:", data);

    // Correctly set the order_id from the response
    const orderId = data.id;
    console.log("Correct Order ID:", orderId);

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID not found in API response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: orderId, // Correct order_id directly from response
      number: data.phone, // Map phone to number for frontend compatibility
      operator: data.operator,
      product: data.product,
      price: data.price,
      status: data.status,
      country: data.country,
      expires: data.expires,
      created_at: data.created_at,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
