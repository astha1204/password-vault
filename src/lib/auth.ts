import { NextApiRequest } from "next";
import User from "../models/User";
import jwt, { JwtPayload } from "jsonwebtoken";

interface MyJwtPayload extends JwtPayload {
  id: string;
}

export async function getUserFromToken(req: NextApiRequest) {
  const token = req.cookies?.token;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as MyJwtPayload | string;
    if (typeof payload === "string") return null;

    const userId = payload.id || payload.sub;
    if (!userId) return null;

    const user = await User.findById(userId);
    return user;
  } catch (err) {
    return null;
  }
}
