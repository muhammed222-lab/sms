/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

// Base URLs
const GUEST_PRICES_URL = "https://5sim.net/v1/guest/prices";
const PRICE_LIMITS_URL = "https://5sim.net/v1/guest/price_limits"; // Assuming this endpoint exists
const MAX_PRICES_URL = "https://5sim.net/v1/user/max-prices";

const BUY_ACTIVATION_URL = "https://5sim.net/v1/user/buy/activation";
const BUY_HOSTING_URL = "https://5sim.net/v1/user/buy/hosting";
const REUSE_URL = "https://5sim.net/v1/user/reuse";
const CHECK_ORDER_URL = "https://5sim.net/v1/user/check";
const FINISH_ORDER_URL = "https://5sim.net/v1/user/finish";
const CANCEL_ORDER_URL = "https://5sim.net/v1/user/cancel";
const BAN_ORDER_URL = "https://5sim.net/v1/user/ban";
const SMS_INBOX_URL = "https://5sim.net/v1/user/sms/inbox";

const NOTIFICATIONS_URL = "https://5sim.net/v1/guest/flash";
const VENDOR_URL = "https://5sim.net/v1/user/vendor";
const WALLETS_URL = "https://5sim.net/v1/vendor/wallets";
const VENDOR_ORDERS_URL = "https://5sim.net/v1/vendor/orders";
const VENDOR_PAYMENTS_URL = "https://5sim.net/v1/vendor/payments";
const WITHDRAW_URL = "https://5sim.net/v1/vendor/withdraw";
const COUNTRIES_URL = "https://5sim.net/v1/guest/countries";

// Helper for authorized requests
const getHeaders = (contentType?: string) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${process.env.FIVESIM_API_KEY}`,
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return headers;
};

/**
 * GET handler for guest prices.
 * Supports query parameters: country and product.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const product = searchParams.get("product");

    let url = GUEST_PRICES_URL;
    if (country && product) {
      url += `?country=${country}&product=${product}`;
    } else if (country) {
      url += `?country=${country}`;
    } else if (product) {
      url += `?product=${product}`;
    }

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch guest prices" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Price limits management handler:
 * GET, POST, PUT, DELETE for managing price limits.
 */
export async function priceLimitsHandler(req: Request) {
  const method = req.method;
  try {
    switch (method) {
      case "GET": {
        const response = await fetch(PRICE_LIMITS_URL, {
          headers: getHeaders(),
        });
        if (!response.ok) {
          return NextResponse.json(
            { error: "Failed to fetch price limits" },
            { status: response.status }
          );
        }
        const priceLimitsData = await response.json();
        return NextResponse.json(priceLimitsData);
      }
      case "POST": {
        const createData = await req.json();
        const createResponse = await fetch(PRICE_LIMITS_URL, {
          method: "POST",
          headers: getHeaders("application/json"),
          body: JSON.stringify(createData),
        });
        if (!createResponse.ok) {
          return NextResponse.json(
            { error: "Failed to create price limit" },
            { status: createResponse.status }
          );
        }
        const createdLimit = await createResponse.json();
        return NextResponse.json(createdLimit);
      }
      case "PUT": {
        const updateData = await req.json();
        const updateResponse = await fetch(
          `${PRICE_LIMITS_URL}/${updateData.id}`,
          {
            method: "PUT",
            headers: getHeaders("application/json"),
            body: JSON.stringify(updateData),
          }
        );
        if (!updateResponse.ok) {
          return NextResponse.json(
            { error: "Failed to update price limit" },
            { status: updateResponse.status }
          );
        }
        const updatedLimit = await updateResponse.json();
        return NextResponse.json(updatedLimit);
      }
      case "DELETE": {
        const { id } = await req.json();
        const deleteResponse = await fetch(`${PRICE_LIMITS_URL}/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        if (!deleteResponse.ok) {
          return NextResponse.json(
            { error: "Failed to delete price limit" },
            { status: deleteResponse.status }
          );
        }
        return NextResponse.json({
          message: "Price limit deleted successfully",
        });
      }
      default:
        return NextResponse.json(
          { error: "Method not allowed" },
          { status: 405 }
        );
    }
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * MAX PRICES endpoints.
 * GET: list max-prices.
 */
export async function maxPricesHandler(req: Request) {
  try {
    const response = await fetch(MAX_PRICES_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch max prices" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Purchase an activation number.
 * Expects URL parameters: country, operator, product.
 */
export async function buyActivationHandler(req: Request) {
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

    // Construct URL, e.g.: /v1/user/buy/activation/{country}/{operator}/{product}
    const url = `${BUY_ACTIVATION_URL}/${country}/${operator}/${product}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to purchase activation number" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Purchase a hosting number.
 * Expects URL parameters: country, operator, product.
 */
export async function buyHostingHandler(req: Request) {
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

    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to purchase hosting number" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Reuse (re-buy) a number.
 * Expects URL parameters: product and number.
 */
export async function reuseNumberHandler(req: Request) {
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

    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to reuse number" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Check order status.
 * Expects URL parameter: id (order id).
 */
export async function checkOrderHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const url = `${CHECK_ORDER_URL}/${id}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to check order" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Finish order.
 * Expects URL parameter: id.
 */
export async function finishOrderHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const url = `${FINISH_ORDER_URL}/${id}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to finish order" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Cancel order.
 * Expects URL parameter: id.
 */
export async function cancelOrderHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const url = `${CANCEL_ORDER_URL}/${id}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to cancel order" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Ban order.
 * Expects URL parameter: id.
 */
export async function banOrderHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const url = `${BAN_ORDER_URL}/${id}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to ban order" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Get SMS inbox list.
 * Expects URL parameter: id (order id).
 */
export async function getSmsInboxHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const url = `${SMS_INBOX_URL}/${id}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch SMS inbox" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Get notifications.
 * Expects URL parameter: lang.
 */
export async function getNotificationsHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "en";
    const url = `${NOTIFICATIONS_URL}/${lang}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Get vendor information.
 */
export async function getVendorHandler(req: Request) {
  try {
    const response = await fetch(VENDOR_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vendor info" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Get vendor wallets (reserves).
 */
export async function getWalletsHandler(req: Request) {
  try {
    const response = await fetch(WALLETS_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch wallets" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Get vendor orders.
 * Query parameters: category, limit, offset, order, reverse.
 */
export async function vendorOrdersHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = new URL(VENDOR_ORDERS_URL);
    // Pass through possible query params.
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    const response = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vendor orders" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Get vendor payments.
 * Query parameters: limit, offset, order, reverse.
 */
export async function vendorPaymentsHandler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = new URL(VENDOR_PAYMENTS_URL);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    const response = await fetch(url.toString(), {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch vendor payments" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Create vendor payout.
 * Expects JSON body with receiver, method, amount, fee.
 */
export async function createPayoutHandler(req: Request) {
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
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

/**
 * Get countries list.
 */
export async function getCountriesHandler(req: Request) {
  try {
    const response = await fetch(COUNTRIES_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch countries" },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
