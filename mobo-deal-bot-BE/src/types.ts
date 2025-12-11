export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  token: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  tags: string[];
  platform?: "Amazon" | "Flipkart" | "Myntra" | "Ajio" |"Other";
  dealType?: "Review" | "Rating" | "Discount";
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  title: string;
  image: string;
}

export enum OrderStatus {
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  ReviewSubmitted = "Review Submitted",
  RefundProcessed = "Refund Processed"
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: "Paid" | "Pending" | "Failed" | "Refunded" | "Partially Refunded";
  createdAt: string;
  paymentMethod: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
  relatedProducts?: Product[];
  relatedOrders?: Order[];
  isError?: boolean;
}

export interface AIResponseSchema {
  responseText: string;
  intent: "greeting" | "search_deals" | "check_order" | "support" | "unknown";
  recommendedProductIds?: string[];
  orderQueryId?: string;
}