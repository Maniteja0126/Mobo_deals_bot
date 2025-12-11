import mongoose, { Schema, InferSchemaType } from "mongoose";

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true }
}, { _id: false });

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Review Submitted", "Refund Processed"],
    default: "Processing"
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending", "Failed", "Refunded", "Partially Refunded"],
    default: "Pending"
  },
  paymentMethod: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });

export type OrderDoc = InferSchemaType<typeof OrderSchema> & { _id: mongoose.Types.ObjectId };
export const OrderModel = mongoose.model("Order", OrderSchema);