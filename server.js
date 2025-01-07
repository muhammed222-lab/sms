import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const API_BASE_URL = process.env.API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;
// Axios instance for requests
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to handle API requests
const makeApiRequest = async (endpoint, params) => {
  try {
    const response = await axiosInstance.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error("API Request Error:", error.message);
    console.error(
      "Error Details:",
      error.response ? error.response.data : error
    );
    throw new Error(error.response?.data?.error_msg || "An error occurred");
  }
};

// Proxy endpoint for services
app.get("/api/services", async (req, res) => {
  try {
    const data = await makeApiRequest("/applications", { token: API_TOKEN });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for countries
app.get("/api/countries", async (req, res) => {
  try {
    const data = await makeApiRequest("/countries", { token: API_TOKEN });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for limits
app.get("/api/limits", async (req, res) => {
  const { country_id, application_id } = req.query;
  try {
    const data = await makeApiRequest("/limits", {
      token: API_TOKEN,
      country_id,
      application_id,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for requesting a phone number
app.get("/api/get-number", async (req, res) => {
  const { country_id, application_id } = req.query;
  try {
    const data = await makeApiRequest("/get-number", {
      token: API_TOKEN,
      country_id,
      application_id,
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching number:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for fetching SMS
app.get("/api/get-sms", async (req, res) => {
  const { request_id } = req.query;
  try {
    const data = await makeApiRequest("/get-sms", {
      token: API_TOKEN,
      request_id,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for fetching prices
app.get("/api/prices", async (req, res) => {
  const { country_id } = req.query;
  try {
    const data = await makeApiRequest("/get-prices", {
      token: API_TOKEN,
      country_id,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for getting balance
app.get("/api/get-balance", async (req, res) => {
  try {
    const data = await makeApiRequest("/get-balance", { token: API_TOKEN });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for setting request status
app.get("/api/set-status", async (req, res) => {
  const { request_id, status } = req.query;
  try {
    const data = await makeApiRequest("/set-status", {
      token: API_TOKEN,
      request_id,
      status,
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
