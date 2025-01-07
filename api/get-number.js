import { makeApiRequest } from "./shared/axios-instance";

export default async function handler(req, res) {
  const { country_id, type, time } = req.query;

  try {
    const data = await makeApiRequest("/get-number", {
      country_id,
      type,
      time,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
