import { makeApiRequest } from "./shared/axios-instance";

export default async function handler(req, res) {
  const { country_id, type, time } = req.query;

  if (!country_id || !type || !time) {
    return res.status(400).json({
      error: "Missing required query parameters: country_id, type, time",
    });
  }

  try {
    const data = await makeApiRequest("/limits", {
      country_id,
      type,
      time,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
