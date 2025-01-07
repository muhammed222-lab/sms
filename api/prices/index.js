import { makeApiRequest } from "../shared/axios-instance";

export default async function handler(req, res) {
  const { country_id } = req.query;
  try {
    const data = await makeApiRequest("/get-prices", {
      token: process.env.API_TOKEN,
      country_id,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
