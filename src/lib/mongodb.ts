import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI env var");

let cached = (global as any).__mongoCache as { conn?: typeof mongoose } | undefined;

if (!cached) {
  cached = (global as any).__mongoCache = {};
}

export default async function connectToDB() {
  if (cached!.conn) return cached!.conn;
  const conn = await mongoose.connect(MONGODB_URI);
  cached!.conn = conn;
  return conn;
}
