const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
dotenv.config({ path: ".env.local" });

app.use(cors());
app.use(express.json());

const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID;
const API_KEY = process.env.CRYPTOMUS_API_KEY;

app.post("/checkout", async (req, res) => {
  console.log("Received request body:", req.body);

  let { amount, currency } = req.body;

  if (!amount || !currency) {
    return res.status(400).json({ error: "Amount and currency are required." });
  }

  if (isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Amount must be a valid positive number." });
  }

  amount = Number(amount).toFixed(2); // Ensure amount is a string with two decimal places

  try {
    const order_id = crypto.randomBytes(12).toString("hex");

    const data = {
      amount,
      currency,
      order_id,
      url_success: "https://yourdomain.com/success",
      url_callback: "https://your-ngrok-url/callback",
    };

    const dataBase64 = Buffer.from(JSON.stringify(data)).toString("base64");
    const sign = crypto
      .createHash("md5")
      .update(dataBase64 + API_KEY)
      .digest("hex");

    const headers = {
      merchant: MERCHANT_ID,
      sign,
    };

    const response = await axios.post(
      "https://api.cryptomus.com/v1/payment",
      data,
      { headers }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Error creating invoice:", error.message);

    if (error.response) {
      return res
        .status(error.response.status)
        .json({ error: error.response.data });
    }

    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

app.post("/callback", (req, res) => {
  console.log("Callback received:", req.body);

  try {
    const { sign } = req.body;

    if (!sign) {
      return res.status(400).json({ error: "Sign is required." });
    }

    const data = req.body;
    delete data.sign;

    const hash = crypto
      .createHash("md5")
      .update(Buffer.from(JSON.stringify(data)).toString("base64") + API_KEY)
      .digest("hex");

    if (hash !== sign) {
      return res.status(400).json({ error: "Invalid sign." });
    }

    console.log("Valid callback data:", data);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error in callback:", error.message);
    res.status(500).json({ error: "Invalid callback request." });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
