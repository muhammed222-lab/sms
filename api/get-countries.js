import { makeApiRequest } from "./shared/axios-instance";

export default async function handler(req, res) {
  try {
    const data = await makeApiRequest("/limits", {
      type: "hour",
      time: 7,
    });
    const countries = data.limits.map((limit) => ({
      id: limit.country_id,
      name_en: `Country ${limit.country_id}`, // Placeholder name
      count: limit.count,
      cost: limit.cost,
    }));
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
