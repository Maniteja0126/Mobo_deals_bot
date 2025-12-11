import { Router } from "express";
import { z } from "zod";
import { OrderModel } from "../models/Order.js";
import { OrderStatus } from "../types.js";

const router = Router();

const orderSchema = z.object({
  userId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    priceAtPurchase: z.number().positive(),
    title: z.string(),
    image: z.string()
  })),
  paymentMethod: z.string(),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.Processing),
  paymentStatus: z.enum(["Paid", "Pending", "Failed", "Refunded", "Partially Refunded"]).default("Pending")
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = orderSchema.parse(req.body);
    const total = parsed.items.reduce((sum, i) => sum + i.quantity * i.priceAtPurchase, 0);
    const doc = await OrderModel.create({
      userId: parsed.userId,
      items: parsed.items,
      total,
      status: parsed.status,
      paymentStatus: parsed.paymentStatus,
      paymentMethod: parsed.paymentMethod,
      createdAt: new Date().toISOString()
    });
    res.status(201).json({
      id: doc.id,
      userId: doc.userId,
      items: doc.items,
      total: doc.total,
      status: doc.status,
      paymentStatus: doc.paymentStatus,
      paymentMethod: doc.paymentMethod,
      createdAt: doc.createdAt
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const list = await OrderModel.find({ userId: req.params.id }).lean();
    const mapped = list.map(o => ({
      id: o._id.toString(),
      userId: o.userId,
      items: o.items,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt
    }));
    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

export default router;