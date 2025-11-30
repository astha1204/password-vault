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
  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    const { ciphertext, iv } = req.body as { ciphertext: string; iv: string };
    if (!ciphertext || !iv) return res.status(400).json({ error: "Missing ciphertext or iv" });

    const updated = await VaultItem.findOneAndUpdate(
      { _id: id, userId },
      { ciphertext, iv },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json({ ok: true });
  }

  if (req.method === "DELETE") {
    const deleted = await VaultItem.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.json({ ok: true });
  }

  return res.status(405).end();
}
