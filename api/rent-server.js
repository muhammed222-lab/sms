import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

const API_BASE_URL = "https://api.sms-man.com/rent-api";
const API_KEY = "dV7cFg6-45PTQ2lanH6hEjNe5IjX1dEm";

// Configure Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20 seconds timeout
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Helper function to handle errors
const handleAxiosError = (error) => {
  if (error.response) {
    console.error("API Response Error:", error.response.data);
    return {
      status: error.response.status,
      message: error.response.data.error_msg || "API response error",
    };
  } else if (error.request) {
    console.error("No Response from API:", error.request);
    return { status: 500, message: "No response from API" };
  } else {
    console.error("Request Error:", error.message);
    return { status: 500, message: error.message || "Request error" };
  }
};

// Endpoint: Get Balance
app.get("/api/get-balance", async (req, res) => {
  try {
    const response = await axiosInstance.get(`/get-balance`, {
      params: { token: API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    const { status, message } = handleAxiosError(error);
    res.status(status).json({ error: message });
  }
});

// Endpoint: Get Countries and Limits
app.get("/api/countries", async (req, res) => {
  try {
    const response = await axiosInstance.get(`/limits`, {
      params: {
        token: API_KEY,
        type: "hour", // Default type
        time: 7, // Default time
      },
    });

    const limits = response.data.limits || [];
    const countries = limits.map((limit) => ({
      id: limit.country_id,
      name_en: `Country ${limit.country_id}`, // Placeholder name
      count: limit.count,
      cost: limit.cost,
    }));

    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch countries. Please try again later." });
  }
});

// Endpoint: Rent a Number
app.get("/api/get-number", async (req, res) => {
  const { country_id, type, time } = req.query;
  try {
    const response = await axiosInstance.get(`/get-number`, {
      params: { token: API_KEY, country_id, type, time },
    });
    res.json(response.data);
  } catch (error) {
    const { status, message } = handleAxiosError(error);
    res.status(status).json({ error: message });
  }
});

// Endpoint: Get SMS
app.get("/api/get-sms", async (req, res) => {
  const { request_id } = req.query;
  try {
    const response = await axiosInstance.get(`/get-sms`, {
      params: { token: API_KEY, request_id },
    });
    res.json(response.data);
  } catch (error) {
    const { status, message } = handleAxiosError(error);
    res.status(status).json({ error: message });
  }
});

// Endpoint: Fetch Rental Limits for a Country
app.get("/api/limits", async (req, res) => {
  const { country_id, type, time } = req.query;

  if (!country_id || !type || !time) {
    return res.status(400).json({
      error: "Missing required query parameters: country_id, type, time",
    });
  }

  try {
    const response = await axiosInstance.get(`/limits`, {
      params: {
        token: API_KEY,
        country_id,
        type,
        time,
      },
    });

    if (response.data && Array.isArray(response.data.limits)) {
      res.json(response.data.limits);
    } else {
      res.status(500).json({ error: "No rental data available." });
    }
  } catch (error) {
    console.error("Error fetching rental limits:", error.message);
    const errorDetails = error.response?.data || error.message;
    res.status(500).json({ error: errorDetails });
  }
});

// Endpoint: Set Status
app.get("/api/set-status", async (req, res) => {
  const { request_id, status } = req.query;
  try {
    const response = await axiosInstance.get(`/set-status`, {
      params: { token: API_KEY, request_id, status },
    });
    res.json(response.data);
  } catch (error) {
    const { status, message } = handleAxiosError(error);
    res.status(status).json({ error: message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
