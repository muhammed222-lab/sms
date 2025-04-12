// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextResponse } from "next/server";
// import { headers } from "next/headers";

// // Environment variables
// const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || "";

// // Cache verification results for 5 minutes to prevent duplicate verifications
// const verificationCache = new Map<string, { data: any; timestamp: number }>();
// const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// export async function POST(request: Request) {
//   try {
//     // Check for API key in headers for additional security
//     const apiKey = (await headers()).get("x-api-key");
//     if (apiKey !== process.env.API_SECRET) {
//       return NextResponse.json(
//         { status: "error", message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Parse the incoming request payload
//     const { transactionId } = await request.json();

//     if (!transactionId) {
//       return NextResponse.json(
//         { status: "error", message: "Missing transaction ID." },
//         { status: 400 }
//       );
//     }

//     // Check cache first
//     const cachedResult = verificationCache.get(transactionId);
//     if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
//       console.log("Returning cached verification result for:", transactionId);
//       return NextResponse.json({
//         status: "success",
//         data: cachedResult.data,
//         cached: true,
//       });
//     }

//     console.log("Verifying transaction with ID:", transactionId);

//     // Make the API request to verify the transaction
//     const response = await fetch(
//       `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${FLW_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//         next: { revalidate: 300 }, // Cache at platform level for 5 minutes
//       }
//     );

//     // Handle non-OK responses
//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error(
//         "Flutterwave API error:",
//         errorData.message || response.statusText
//       );
//       return NextResponse.json(
//         {
//           status: "error",
//           message: errorData.message || "Failed to verify transaction",
//           code: response.status,
//         },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();

//     if (data.status === "success" && data.data) {
//       console.log("Transaction verification successful:", data.data.id);

//       // Cache the successful verification
//       verificationCache.set(transactionId, {
//         data: data.data,
//         timestamp: Date.now(),
//       });

//       // Additional validation checks
//       if (data.data.status !== "successful") {
//         return NextResponse.json(
//           {
//             status: "error",
//             message: "Transaction not successful",
//             data: data.data,
//           },
//           { status: 400 }
//         );
//       }

//       return NextResponse.json({
//         status: "success",
//         data: data.data,
//       });
//     } else {
//       console.error("Transaction verification failed:", data.message);
//       return NextResponse.json(
//         {
//           status: "error",
//           message: data.message || "Transaction verification failed.",
//           data: data,
//         },
//         { status: 400 }
//       );
//     }
//   } catch (error: unknown) {
//     // Handle error safely by narrowing the type
//     if (error instanceof Error) {
//       console.error("Error verifying transaction:", error.message);
//       return NextResponse.json(
//         {
//           status: "error",
//           message: error.message || "Failed to verify transaction.",
//         },
//         { status: 500 }
//       );
//     } else {
//       console.error("Unexpected error verifying transaction:", error);
//       return NextResponse.json(
//         {
//           status: "error",
//           message: "An unexpected error occurred while verifying transaction.",
//         },
//         { status: 500 }
//       );
//     }
//   }
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

// Environment variables
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || "";
const API_SECRET = process.env.API_SECRET || "";

// Cache verification results
const verificationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: Request) {
  try {
    // Get headers from request directly
    const headers = Object.fromEntries(request.headers.entries());
    const apiKey = headers["x-api-key"];

    if (apiKey !== API_SECRET) {
      console.error("Invalid API key received:", apiKey);
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { status: "error", message: "Missing transaction ID." },
        { status: 400 }
      );
    }

    // Check cache first
    const cachedResult = verificationCache.get(transactionId);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
      return NextResponse.json({
        status: "success",
        data: cachedResult.data,
        cached: true,
      });
    }

    // Verify with Flutterwave
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Flutterwave API error:", errorData.message);
      return NextResponse.json(
        {
          status: "error",
          message: errorData.message || "Failed to verify transaction",
          code: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.status === "success" && data.data) {
      // Cache successful verification
      verificationCache.set(transactionId, {
        data: data.data,
        timestamp: Date.now(),
      });

      if (data.data.status !== "successful") {
        return NextResponse.json(
          {
            status: "error",
            message: "Transaction not successful",
            data: data.data,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: "success",
        data: data.data,
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: data.message || "Transaction verification failed.",
          data: data,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
