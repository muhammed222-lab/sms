import { Schema, model } from "mongoose";

const virtualNumberSchema = new Schema({
  userId: { type: String, required: true },
  virtualNumber: { type: String, required: true, unique: true },
  verificationCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default model("VirtualNumber", virtualNumberSchema);
