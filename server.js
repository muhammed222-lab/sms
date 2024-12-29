import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const API_BASE_URL = "https://api.sms-man.com/stubs/handler_api.php";
const API_KEY = process.env.API_KEY;

// Axios instance with increased maxContentLength and maxBodyLength
const axiosInstance = axios.create({
  maxContentLength: 100 * 1024 * 1024, // 100 MB
  maxBodyLength: 100 * 1024 * 1024, // 100 MB
  timeout: 10000, // 10 seconds timeout
});

// Proxy endpoint for services
app.get("/api/services", async (req, res) => {
  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getServices",
        api_key: API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching services:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res
      .status(500)
      .json({ error: "Failed to fetch services. Please try again later." });
  }
});

// Proxy endpoint for countries
app.get("/api/countries", async (req, res) => {
  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getCountries",
        api_key: API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching countries:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res
      .status(500)
      .json({ error: "Failed to fetch countries. Please try again later." });
  }
});

// Proxy endpoint for fetching limits
app.get("/api/limits", async (req, res) => {
  const { country_id, application_id } = req.query;
  console.log(
    `Fetching limits with params: country_id=${country_id}, application_id=${application_id}`
  );
  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getLimits",
        api_key: API_KEY,
        country: country_id,
        service: application_id,
      },
    });
    console.log("Limits Data Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching limits:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res
      .status(500)
      .json({ error: "Failed to fetch limits. Please try again later." });
  }
});

// Proxy endpoint for fetching phone number
app.get("/api/get-number", async (req, res) => {
  const { country_id, application_id, testMode } = req.query;

  if (testMode === "true") {
    // Return mock response for testing
    console.log("Test mode enabled. Returning mock response.");
    return res.json({
      country_id,
      application_id,
      number: "+1234567890", // Mock phone number
      request_id: "mock-request-id", // Mock request ID
    });
  }

  console.log(
    "Received country_id:",
    country_id,
    "application_id:",
    application_id
  );

  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getNumber",
        api_key: API_KEY,
        country: country_id,
        service: application_id,
      },
    });

    console.log("Response from API:", response.data); // Log the API response
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching phone number:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for getting prices
app.get("/api/prices", async (req, res) => {
  const { country_id, service } = req.query;
  console.log("Received country_id:", country_id, "service:", service); // Log the country_id and service
  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getPrices",
        api_key: API_KEY,
        country: country_id,
        service: service,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching prices:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res
      .status(500)
      .json({ error: "Failed to fetch prices. Please try again later." });
  }
});

// Proxy endpoint for getting balance
app.get("/api/get-balance", async (req, res) => {
  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getBalance",
        api_key: API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res
      .status(500)
      .json({ error: "Failed to fetch balance. Please try again later." });
  }
});

// Proxy endpoint for changing request status
app.get("/api/set-status", async (req, res) => {
  const { request_id, status } = req.query;
  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "setStatus",
        api_key: API_KEY,
        id: request_id,
        status: status,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error setting status:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res
      .status(500)
      .json({ error: "Failed to set status. Please try again later." });
  }
});

// Proxy endpoint for getting SMS
app.get("/api/get-sms", async (req, res) => {
  const { request_id } = req.query;
  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getStatus",
        api_key: API_KEY,
        id: request_id,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching SMS:", error.message);
    console.error(
      "Error details:",
      error.response ? error.response.data : error
    );
    res
      .status(500)
      .json({ error: "Failed to fetch SMS. Please try again later." });
  }
});

// Start the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
