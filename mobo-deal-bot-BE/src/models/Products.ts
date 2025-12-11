import mongoose, { Schema, InferSchemaType } from "mongoose";

const ProductSchema = new Schema({
  id : {type : String, required : true, unique : true},
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String,
  rating: Number,
  tags: [String],
  platform: { type: String, enum: ["Amazon", "Flipkart", "Myntra", "Other"] },
  dealType: { type: String, enum: ["Review", "Rating", "Discount"] }
}, { timestamps: true });

export type ProductDoc = InferSchemaType<typeof ProductSchema> & { _id: mongoose.Types.ObjectId };
export const ProductModel = mongoose.model("Product", ProductSchema);