import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Product, Order } from '../types';

// In a real build, this would be imported from a config file or env
const MODEL_NAME = 'gemini-2.5-flash';

// Define the response schema we want from Gemini
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
      description: "The detected intent of the user."
    },
    recommendedProductIds: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of Product IDs to show as rich cards if the user is looking for products."
    },
    orderQueryId: {
      type: Type.STRING,
      description: "If the user is asking about a specific order, extract the ID. If asking for 'latest', use 'latest'."
    }
  },
  required: ["responseText", "intent"],
};

export const generateBotResponse = async (
  apiKey: string,
  userMessage: string,
  products: Product[],
  userOrders: Order[] | null,
  userName: string
): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Create a lean representation of products for the context window
    const productCatalog = products.map(p => ({
      id: p.id,
      title: p.title,
      full_deal_details: p.description, // Important: sending the full text with PP details
      approx_price: p.price,
      platform: p.platform
    }));

    // Create a lean representation of orders
    const orderHistory = userOrders ? userOrders.map(o => ({
      id: o.id,
      date: o.createdAt,
      status: o.status,
      paymentStatus: o.paymentStatus,
      items: o.items.map(i => i.title).join(", ")
    })) : "User is not logged in.";

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
      **User Name**: ${userName || 'Guest'}

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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
        temperature: 0.5, // Lower temperature for more accurate math/logic
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(responseText);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      responseText: "Server busy! Too many deals dropping. Try again in a sec! 😅",
      intent: "unknown"
    };
  }
};