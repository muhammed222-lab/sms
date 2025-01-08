import { makeApiRequest } from "../shared/axios-instance";

export default async function handler(req, res) {
  const { action, ...params } = req.query;

  if (!action) {
    return res.status(400).json({ error: "Missing 'action' query parameter" });
  }

  try {
    let endpoint;
    let payload;

    if (action === "get-number") {
      const { country_id, application_id } = params;
      if (!country_id || !application_id) {
        return res.status(400).json({
          error:
            "Missing required query parameters: country_id, application_id",
        });
      }
      endpoint = "/get-number";
      payload = {
        token: process.env.API_TOKEN,
        country_id,
        application_id,
      };
    } else if (action === "set-status") {
      const { request_id, status } = params;
      if (!request_id || !status) {
        return res.status(400).json({
          error: "Missing required query parameters: request_id, status",
        });
      }
      endpoint = "/set-status";
      payload = {
        token: process.env.API_TOKEN,
        request_id,
        status,
      };
    } else {
      return res.status(400).json({ error: "Invalid 'action' parameter" });
    }

    const data = await makeApiRequest(endpoint, payload);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
