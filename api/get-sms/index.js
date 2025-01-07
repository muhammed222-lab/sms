import { makeApiRequest } from "../shared/axios-instance";

export default async function handler(req, res) {
  const { request_id } = req.query;
  try {
    const data = await makeApiRequest("/get-sms", {
      token: process.env.API_TOKEN,
      request_id,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
