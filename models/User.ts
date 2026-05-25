import { Schema, model, models } from "mongoose";

const shippingAddressSchema = new Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    street: { type: String, default: "" },
    apartment: { type: String, default: "" },
    city: { type: String, default: "" },
    commune: { type: String, default: "" },
    country: { type: String, default: "Algeria" },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    provider: { type: String, default: "google" },
    role: { type: String, default: "user" },
    lastLoginAt: { type: Date, default: Date.now },
    shippingAddress: { type: shippingAddressSchema, default: undefined },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const existingModel = models.User;

if (existingModel) {
  const hasPasswordHash = existingModel.schema.path("passwordHash");
  const hasShippingAddress = existingModel.schema.path("shippingAddress");

  if (!hasPasswordHash || !hasShippingAddress) {
    delete models.User;
  }
}

const User = models.User || model("User", UserSchema);
export default User;
