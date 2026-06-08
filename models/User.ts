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
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    passwordHash: { type: String, default: "", select: false },
    provider: {
      type: String,
      enum: ["google", "credentials"],
      default: "google",
    },
    providers: {
      type: [{ type: String, enum: ["google", "credentials"] }],
      default: [],
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    sessionVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: Date.now },
    shippingAddress: { type: shippingAddressSchema, default: undefined },
    abandonedCartEmailsEnabled: { type: Boolean, default: true },
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
  const hasAbandonedCartEmails = existingModel.schema.path(
    "abandonedCartEmailsEnabled",
  );
  const hasSessionVersion = existingModel.schema.path("sessionVersion");
  const hasProviders = existingModel.schema.path("providers");

  if (
    !hasPasswordHash ||
    !hasShippingAddress ||
    !hasAbandonedCartEmails ||
    !hasSessionVersion ||
    !hasProviders
  ) {
    delete models.User;
  }
}

const User = models.User || model("User", UserSchema);
export default User;
