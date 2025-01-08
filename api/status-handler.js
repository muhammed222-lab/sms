import { makeApiRequest } from "./shared/axios-instance";

export default async function handler(req, res) {
  const { action } = req.query;

  if (!action) {
    return res.status(400).json({
      error: "Missing required query parameter: action",
    });
  }

  try {
    if (action === "get-limit") {
      const { country_id, type, time } = req.query;

      if (!country_id || !type || !time) {
        return res.status(400).json({
          error: "Missing required query parameters: country_id, type, time",
        });
      }

      const data = await makeApiRequest("/limits", {
        country_id,
        type,
        time,
      });
      return res.status(200).json(data);
    } else if (action === "set-status") {
      const { request_id, status } = req.query;

      if (!request_id || !status) {
        return res.status(400).json({
          error: "Missing required query parameters: request_id, status",
        });
      }

      const data = await makeApiRequest("/set-status", {
        request_id,
        status,
      });
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: "Invalid action parameter" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
