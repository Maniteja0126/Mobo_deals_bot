import { env } from "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDb } from "./config/db";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import chatRoutes from "./routes/chatOpenAI";
import { errorHandler } from "./middleware/error";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN || "*" }));
app.use(morgan("combined"));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDb();
  app.listen(env.PORT, () => console.log(`API running on ${env.PORT}`));
};

start();