import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    provider: { type: String, default: "google" },
    role: { type: String, default: "user" },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const User = models.User || model("User", UserSchema);
export default User;
