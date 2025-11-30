// src/pages/api/auth/signup.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDB from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, encryptionSalt } = req.body as { email: string; password: string; encryptionSalt?: string };

  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  await connectToDB();

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "User exists" });

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create an encryption salt if client didn’t provide one (base64 string)
  const saltToStore = encryptionSalt ?? cryptoRandomBytes(16).toString("base64");

  const user = await User.create({ email, passwordHash, encryptionSalt: saltToStore });

  // Create JWT token for session (expires in 7 days)
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

  // Set cookie to hold token securely (HttpOnly)
  res.setHeader("Set-Cookie", cookie.serialize("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 }));

  return res.status(201).json({ encryptionSalt: saltToStore });
}

function cryptoRandomBytes(n: number) {
  return crypto.randomBytes(n);
}
