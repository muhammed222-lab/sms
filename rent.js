import express from "express";
import axios from "axios";

const rentRouter = express.Router();
const API_BASE_URL = "https://api.sms-man.com/stubs/handler_api.php";
const RENT_API_KEY = "xHwwy2zvDS9Uig1vTphq9ngvkVNBCEwf"; // Use a separate API key

// Axios instance with increased limits
const axiosInstance = axios.create({
  maxContentLength: 100 * 1024 * 1024,
  maxBodyLength: 100 * 1024 * 1024,
  timeout: 10000,
});

// Fetch phone number for rent
rentRouter.get("/get-number", async (req, res) => {
  const { country_id, application_id } = req.query;

  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getNumber",
        api_key: RENT_API_KEY,
        country: country_id,
        service: application_id,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching rented number:", error.message);
    res.status(500).json({ error: "Failed to rent number." });
  }
});

// Change request status
rentRouter.get("/set-status", async (req, res) => {
  const { request_id, status } = req.query;

  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "setStatus",
        api_key: RENT_API_KEY,
        id: request_id,
        status: status,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error setting status:", error.message);
    res.status(500).json({ error: "Failed to set status." });
  }
});

// Fetch SMS for a rented number
rentRouter.get("/get-sms", async (req, res) => {
  const { request_id } = req.query;

  try {
    const response = await axiosInstance.get(API_BASE_URL, {
      params: {
        action: "getStatus",
        api_key: RENT_API_KEY,
        id: request_id,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching SMS:", error.message);
    res.status(500).json({ error: "Failed to fetch SMS." });
  }
});

export default rentRouter;
