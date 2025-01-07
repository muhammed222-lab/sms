import { makeApiRequest } from "../shared/axios-instance";

export default async function handler(req, res) {
  const { country_id, application_id } = req.query;
  try {
    const data = await makeApiRequest("/get-number", {
      token: process.env.API_TOKEN,
      country_id,
      application_id,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
