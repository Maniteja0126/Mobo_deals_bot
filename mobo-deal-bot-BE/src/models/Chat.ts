import mongoose, { Schema, InferSchemaType } from "mongoose";

const ChatSchema = new Schema({
  userId: String,
  prompt: Schema.Types.Mixed,
  response: Schema.Types.Mixed,
  createdAt: { type: String, required: true }
}, { timestamps: true });

export type ChatDoc = InferSchemaType<typeof ChatSchema> & { _id: mongoose.Types.ObjectId };
export const ChatModel = mongoose.model("Chat", ChatSchema);