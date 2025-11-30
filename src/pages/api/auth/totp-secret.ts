import type { NextApiRequest, NextApiResponse } from "next";
import speakeasy from "speakeasy";
import { getUserFromToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const secret = speakeasy.generateSecret({
    name: `YourAppName (${user.email})`,
    issuer: "YourAppName" // important for Microsoft Authenticator
  });

  user.totpSecret = secret.base32;
  await user.save();

  res.json({
    otpauth_url: secret.otpauth_url,
    base32: secret.base32,
  });
}
