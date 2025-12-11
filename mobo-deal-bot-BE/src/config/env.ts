import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  MONGODB_URI: z.string().url(),
  MONGODB_DB: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  PORT: z.string().default("4000"),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(1),
  TG_API_ID: z.coerce.number(),
  TG_API_HASH: z.string().min(1),
  TG_SESSION: z.string().optional().default(""),
  TG_CHANNEL_USERNAME: z.string().optional().default(""),
  TG_CHANNELS : z.string().optional().default("")
});

const parsed = schema.parse(process.env);

export const env = {
  ...parsed,
  PORT: parseInt(parsed.PORT, 10)
};