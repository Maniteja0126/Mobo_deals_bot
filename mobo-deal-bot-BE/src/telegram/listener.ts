import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import { env } from "../config/env.js";
import { connectDb } from "../config/db.js";
import { ProductModel } from "../models/Products.js";
import { parseDeals } from "./parser.js";

async function start() {
  await connectDb();

  const channels = env.TG_CHANNELS.split(",")
    .map(c => c.trim().toLowerCase())
    .filter(Boolean);

  console.log("Subscribed channels:", channels);

  const client = new TelegramClient(
    new StringSession(env.TG_SESSION),
    env.TG_API_ID,
    env.TG_API_HASH,
    { connectionRetries: 5 }
  );

  console.log("Connecting to Telegram…");
  await client.connect();

  await client.getDialogs();
  console.log("Telegram dialogs synchronized");

  console.log("Deal Listener Started!");
  console.log("Waiting for deals...\n");

  client.addEventHandler(async (event: any) => {
    const msg = event.message;
    if (!msg?.message) return;

    const chat = await event.getChat();

    const username = chat?.username ? `@${chat.username}`.toLowerCase() : null;
    const channelId = msg.peerId?.channelId?.toString();

    console.log("DEBUG Source:", { username, channelId });

    const isFromTarget =
      (username && channels.includes(username)) ||
      (channelId && channels.includes(channelId));

    if (!isFromTarget) {
      console.log("Ignored (not a subscribed channel)\n");
      return;
    }

    console.log(`New Deal from ${username || channelId}`);
    const text = msg.message;

    const imageUrl = await getImageUrl(client, msg);

    const products = parseDeals(text);
    if (products.length === 0) {
      console.log("No valid deals found\n");
      return;
    }
    
    for (const product of products) {
      product.image = imageUrl;
    
      try {
        await ProductModel.findOneAndUpdate(
          { id: product.id },
          product,
          { upsert: true }
        );
        console.log(`Saved: ${product.title} (${product.id})`);
      } catch (err) {
        console.error("DB Save Error:", err);
      }
    }
    
  }, new NewMessage({}));
}

start().catch(console.error);


async function getImageUrl(client: TelegramClient, msg: any): Promise<string> {
  const fallback = "https://picsum.photos/500";

  if (!msg.media?.photo) return fallback;

  try {
    const buffer = await client.downloadMedia(msg, {});

    if (!buffer || !Buffer.isBuffer(buffer)) {
      console.log("No valid photo buffer");
      return fallback;
    }

    const base64 = buffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch (err) {
    console.log("Failed to fetch photo:", err);
    return fallback;
  }
}

