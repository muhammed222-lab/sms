import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_BASE_URL = "https://api.sms-man.com/rent-api";
const API_KEY = process.env.API_KEY;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // 20 seconds timeout
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const makeApiRequest = async (endpoint, params) => {
  try {
    const response = await axiosInstance.get(endpoint, {
      params: { token: API_KEY, ...params },
    });
    return response.data;
  } catch (error) {
    console.error("API Request Error:", error.message);
    throw new Error(error.response?.data?.error_msg || "An error occurred");
  }
};

export default axiosInstance;
