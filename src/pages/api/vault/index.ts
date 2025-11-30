import type { NextApiRequest, NextApiResponse } from "next";
import connectToDB from "../../../lib/mongodb";
import VaultItem from "../../../models/VaultItem";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

function getUserIdFromReq(req: NextApiRequest) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  await connectToDB();

  if (req.method === "GET") {
    const items = await VaultItem.find({ userId }).sort({ createdAt: -1 });
    return res.json(items.map(i => ({
      _id: i._id,
      ciphertext: i.ciphertext,
      iv: i.iv,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    })));
  }

  if (req.method === "POST") {
    const { ciphertext, iv } = req.body as { ciphertext: string; iv: string };
    if (!ciphertext || !iv) return res.status(400).json({ error: "Missing ciphertext or iv" });

    const created = await VaultItem.create({ userId, ciphertext, iv });
    return res.status(201).json({ id: created._id });
  }

  return res.status(405).end();
}
