import { Router } from "express";
import { z } from "zod";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductModel } from "../models/Products";
import { OrderModel } from "../models/Order";
import { ChatModel } from "../models/Chat";
import { env } from "../config/env";
import { AIResponseSchema, Product, Order } from "../types";

const router = Router();
const MODEL_NAME = "gemini-2.5-flash"; 

const bodySchema = z.object({
  userId: z.string().optional(),
  message: z.string().min(1),
  userName: z.string().optional(),
});

const chatResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    responseText: {
      type: Type.STRING,
      description: "The natural language response to show the user.",
    },
    intent: {
      type: Type.STRING,
      enum: ["greeting", "search_deals", "check_order", "support", "unknown"],
      description: "The detected intent of the user.",
    },
    recommendedProductIds: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of Product IDs to show as rich cards if the user is looking for products.",
    },
    orderQueryId: {
      type: Type.STRING,
      description: "If the user is asking about a specific order, extract the ID. If asking for 'latest', use 'latest'.",
    },
  },
  required: ["responseText", "intent"],
};

router.post("/", async (req, res, next) => {
  try {
    const { userId, message, userName } = bodySchema.parse(req.body);

    const [productList, orderList] = await Promise.all([
      ProductModel.find().limit(50).lean(),
      userId ? OrderModel.find({ userId }).limit(50).lean() : Promise.resolve([]),
    ]);

    const productsDto: Product[] = productList.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description ?? "",
      price: p.price,
      category: p.category,
      image: p.image,
      rating: p.rating,
      tags: p.tags,
      platform: p.platform,
      dealType: p.dealType,
    }));

    const ordersDto: Order[] = orderList.map((o) => ({
      id: o._id.toString(),
      userId: o.userId,
      items: o.items as any,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
    }));

    const productCatalog = productsDto.map((p) => ({
      id: p.id,
      title: p.title,
      full_deal_details: p.description,
      approx_price: p.price,
      platform: p.platform,
    }));

    const orderHistory = ordersDto.length
      ? ordersDto.map((o) => ({
          id: o.id,
          date: o.createdAt,
          status: o.status,
          paymentStatus: o.paymentStatus,
          items: o.items.map((i) => i.title).join(", "),
        }))
      : "User is not logged in.";

    const systemPrompt = `
      You are 'Mobo', a smart Deal Assistant for a Telegram-style deals community.
      Your goal is to help users find "Review Deals", "Rating Deals", and "Loot Deals" from the inventory.
      **Domain Knowledge (CRITICAL):**
      - **PP** means "Purchase Price" (the price the user pays on Amazon/Flipkart).
      - **"Less"** means the refund amount. (e.g., "299 Less" means they get 299 back).
      - **Review Deal**: User buys, writes a text review, gets a refund.
      - **Rating Deal**: User buys, gives 5 stars (no text), gets a refund.
      - **Safe Deal**: Seller is trusted to refund.
      **Current Date**: ${new Date().toLocaleDateString()}
      **User Name**: ${userName || "Guest"}
      **Inventory Data (JSON)**:
      ${JSON.stringify(productCatalog)}
      **User's Recent Orders (JSON)**:
      ${JSON.stringify(orderHistory)}
      **Instructions**:
      1. **Search Deals**: If user asks for "New Deals", "Clock deals", "Free products", or specific items, search the inventory text. Set 'intent' to 'search_deals' and put IDs in 'recommendedProductIds'.
      2. **Explain Deals**: If a user asks "How much will I pay for the clock?" or "What is the refund?", calculate it based on the 'full_deal_details' in the JSON.
         - Example: If detail says "PP 501-999 - 299 Less", and user asks "If I buy clock for 600?", tell them "You pay 600 initially, but you will get 299 back, so effective price is 301."
      3. **Order/Payment Status**: If user asks "Payment status", "Where is my refund", or "Check orders", set 'intent' to 'check_order'.
      4. **Support**: Help with questions like "Is this safe?" or "How do I submit review?".
      5. **Tone**: Casual, like a helpful Telegram admin. Use emojis.
    `;

    const ai = new GoogleGenAI({ apiKey: env.OPENAI_API_KEY });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
        temperature: 0.5,
      },
    });

    const responseText = response.text;
    let parsed: AIResponseSchema = { responseText: "", intent: "unknown" };
    try {
      parsed = responseText ? JSON.parse(responseText) : parsed;
    } catch {
      parsed = { responseText: responseText ?? "", intent: "unknown" };
    }

    const relatedProducts = parsed.recommendedProductIds
      ? productsDto.filter((p) => parsed.recommendedProductIds?.includes(p.id))
      : undefined;
    const relatedOrders = parsed.orderQueryId
      ? ordersDto.filter((o) => o.id === parsed.orderQueryId || parsed.orderQueryId === "latest")
      : undefined;

    await ChatModel.create({
      userId,
      prompt: { message },
      response: { ...parsed, relatedProducts, relatedOrders },
      createdAt: new Date().toISOString(),
    });

    res.json(parsed);
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    next(err);
  }
});

export default router;