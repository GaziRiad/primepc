import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    coverImage: { type: String, default: "" },
    unitPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String, default: "" },
    city: { type: String, required: true },
    commune: { type: String, required: true },
    country: { type: String, default: "Algeria" },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false },
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: { type: customerSchema, required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending_confirmation",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
      ],
      default: "pending_confirmation",
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    paymentMethod: { type: String, default: "cod" },
    source: { type: String, enum: ["user", "guest"], default: "user" },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
