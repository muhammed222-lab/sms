// models/User.ts
import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  generated_number: { type: [Number] },
  balance: { type: Number, default: 0 }, // Default balance is 0
});

const User = models.User || model("User", UserSchema);

export default User;
