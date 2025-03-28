// import { NextResponse } from "next/server";
// import { promises as fs } from "fs";
// import path from "path";

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     // If no country (or search) parameter provided, flatten all services.
//     const country = searchParams.get("country");
//     const search = searchParams.get("search");

//     const filePath = path.join(process.cwd(), "data", "servicesList.json");
//     const fileContents = await fs.readFile(filePath, "utf8");
//     const data = JSON.parse(fileContents);

//     const servicesArray: Array<{
//       country: string;
//       title: string;
//       id: string;
//       price: number;
//       stock: number;
//       rate: number;
//     }> = [];

//     // If country or search is provided, you can filter. Otherwise, flatten all.
//     if (country || search) {
//       // If country provided, only flatten that country.
//       if (country && data[country]) {
//         const countryData = data[country];
//         for (const service in countryData) {
//           const serviceDetails = countryData[service];
//           for (const type in serviceDetails) {
//             const info = serviceDetails[type];
//             servicesArray.push({
//               country,
//               title: service,
//               id: `${country}-${service}-${type}`,
//               price: info.cost,
//               stock: info.count,
//               rate: info.rate || 0,
//             });
//           }
//         }
//       }
//       // Optionally add logic for search here...
//     } else {
//       // No filters? Flatten all services from every country.
//       for (const countryKey in data) {
//         const countryData = data[countryKey];
//         for (const service in countryData) {
//           const serviceDetails = countryData[service];
//           for (const type in serviceDetails) {
//             const info = serviceDetails[type];
//             servicesArray.push({
//               country: countryKey,
//               title: service,
//               id: `${countryKey}-${service}-${type}`,
//               price: info.cost,
//               stock: info.count,
//               rate: info.rate || 0,
//             });
//           }
//         }
//       }
//     }

//     console.log("Returning services:", servicesArray);
//     return NextResponse.json(servicesArray);
//   } catch (error) {
//     console.error("Error reading servicesList.json:", error);
//     return NextResponse.json(
//       { error: "Failed to load services" },
//       { status: 500 }
//     );
//   }
// }

// app/api/getsms/prices/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const product = searchParams.get("product");

    let url = "https://5sim.net/v1/guest/prices";

    if (country) {
      url += `?country=${country}`;
    } else if (product) {
      url += `?product=${product}`;
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Transform the API response into our service array format
    const servicesArray = [];

    for (const countryKey in data) {
      const countryData = data[countryKey];

      for (const productKey in countryData) {
        const productData = countryData[productKey];

        for (const operatorKey in productData) {
          const operatorData = productData[operatorKey];

          servicesArray.push({
            country: countryKey,
            title: productKey,
            operator: operatorKey,
            id: `${countryKey}-${productKey}-${operatorKey}`,
            price: operatorData.cost,
            stock: operatorData.count,
            rate: operatorData.rate || 0,
          });
        }
      }
    }

    return NextResponse.json(servicesArray);
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { error: "Failed to load services" },
      { status: 500 }
    );
  }
}
