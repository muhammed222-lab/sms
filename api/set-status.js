import { makeApiRequest } from "./shared/axios-instance";

export default async function handler(req, res) {
  const { request_id, status } = req.query;

  try {
    const data = await makeApiRequest("/set-status", {
      request_id,
      status,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
