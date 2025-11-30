import type { NextApiRequest, NextApiResponse } from "next";
import { getUserFromToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  res.json({
    email: user.email,
    totpSecret: user.totpSecret || null,
  });
}
