import type { NextApiRequest, NextApiResponse } from "next";
import connectToDB from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, token } = req.body as {
    email: string;
    password: string;
    token?: string;
  };
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  await connectToDB();
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // Check if TOTP 2FA is enabled
  if (user.totpSecret) {
    if (!token) {
      return res.status(200).json({ twoFactorRequired: true, message: "2FA token required" });
    }
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token,
      window: 1,
    });
    if (!verified) {
      return res.status(401).json({ error: "Invalid 2FA token" });
    }
  }

  // Generate JWT token
  const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

  // Set cookie manually (simplest method)
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  const cookieHeader = [
    `token=${jwtToken}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${maxAge}`,
    'SameSite=Strict',
    process.env.NODE_ENV === 'production' ? 'Secure' : ''
  ].filter(Boolean).join('; ');

  res.setHeader("Set-Cookie", cookieHeader);

  return res.json({ encryptionSalt: user.encryptionSalt });
}
