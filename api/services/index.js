import { makeApiRequest } from "../shared/axios-instance";

export default async function handler(req, res) {
  try {
    const data = await makeApiRequest("/applications", {
      token: process.env.API_TOKEN,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
