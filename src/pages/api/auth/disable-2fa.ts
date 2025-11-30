import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    user.totpSecret = undefined;
    await user.save();

    res.json({ success: true, message: "Two-Factor Authentication disabled." });
  } catch (err) {
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
}
