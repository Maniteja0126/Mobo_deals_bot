import mongoose from "mongoose";
import { env } from "./env.js";

console.log("Env " , env.MONGODB_URI , env.MONGODB_DB) 
export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB });
  console.log("Mongo connected");
};