import { makeApiRequest } from "./shared/axios-instance";

export default async function handler(req, res) {
  const { action, ...query } = req.query;

  if (!action) {
    return res.status(400).json({
      error: "Missing required query parameter: action",
    });
  }

  try {
    let data;
    switch (action) {
      case "get-balance":
        data = await makeApiRequest("/get-balance");
        break;

      case "get-countries":
        const limitsData = await makeApiRequest("/limits", {
          type: "hour",
          time: 7,
        });
        data = limitsData.limits.map((limit) => ({
          id: limit.country_id,
          name_en: `Country ${limit.country_id}`, // Replace with actual country names if available
          count: limit.count,
          cost: limit.cost,
        }));
        break;

      case "get-number":
        if (!query.country_id || !query.type || !query.time) {
          return res.status(400).json({
            error: "Missing required query parameters: country_id, type, time",
          });
        }
        data = await makeApiRequest("/get-number", query);
        break;

      case "get-sms":
        if (!query.request_id) {
          return res.status(400).json({
            error: "Missing required query parameter: request_id",
          });
        }
        data = await makeApiRequest("/get-sms", {
          request_id: query.request_id,
        });
        break;

      case "set-status":
        if (!query.request_id || !query.status) {
          return res.status(400).json({
            error: "Missing required query parameters: request_id, status",
          });
        }
        data = await makeApiRequest("/set-status", {
          request_id: query.request_id,
          status: query.status,
        });
        break;

      case "get-limits":
        if (!query.country_id || !query.type || !query.time) {
          return res.status(400).json({
            error: "Missing required query parameters: country_id, type, time",
          });
        }
        data = await makeApiRequest("/limits", query);
        break;

      default:
        return res.status(400).json({ error: "Invalid action parameter" });
    }

    // Validate if the data is returned correctly
    if (!data) {
      return res.status(404).json({ error: "Data not found." });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(`Error in rent-handler: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}
