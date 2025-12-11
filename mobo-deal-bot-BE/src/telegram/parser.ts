import { Product } from "../types.js";

export function parseDeals(text: string): Product[] {
  if (!text) return [];

  const linkMatches = [...text.matchAll(/https?:\/\/\S+/g)];
  if (linkMatches.length === 0) return [];

  const lowerMsg = text.toLowerCase();

  let dealType: Product["dealType"] = "Discount";
  if (lowerMsg.includes("review")) dealType = "Review";
  if (lowerMsg.includes("rating")) dealType = "Rating";

  const title = text.split("\n")[0].trim();

  const products: Product[] = [];

  for (const match of linkMatches) {
    const link = match[0];
    const lowerLink = link.toLowerCase();

    let platform: Product["platform"] = "Other";
    if (lowerLink.includes("amzn") || lowerLink.includes("amazon")) platform = "Amazon";
    else if (lowerLink.includes("fkrt") || lowerLink.includes("flipkart")) platform = "Flipkart";
    else if (lowerLink.includes("ajio") || lowerLink.includes("ajiio") || lowerLink.includes("aji.io")) platform = "Ajio";
    else if (lowerLink.includes("myntr") || lowerLink.includes("myntra")) platform = "Myntra";

    const priceMatch = text.match(/(?:₹|rs|pp|price)[^\d]*(\d{2,6})/i);
    const price = priceMatch ? Number(priceMatch[1]) : 0;

    products.push({
      id: link,
      title: title.slice(0, 80),
      description: text,
      price,
      category: "Deals",
      image: "https://picsum.photos/500", 
      rating: 0,
      tags: [],
      platform,
      dealType,
    });
  }

  return products;
}
