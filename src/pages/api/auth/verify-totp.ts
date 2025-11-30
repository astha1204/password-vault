import type { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";
import { getUserFromToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  const user = await getUserFromToken(req);
  if (!user || !user.totpSecret) return res.status(400).json({ error: "2FA not enabled" });

  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: "base32",
    token,
    window: 2, // allow ±2 steps (30s each)
  });

  if (verified) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid token" });
  }
}
