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
    variantId: { type: String, default: "" },
    variantLabel: { type: String, default: "" },
    variantOptions: {
      type: [
        {
          name: { type: String, required: true },
          value: { type: String, required: true },
          _id: false,
        },
      ],
      default: [],
    },
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
    idempotencyKey: { type: String },
    idempotencyFingerprint: { type: String },
    paymentMethod: { type: String, default: "cod" },
    source: { type: String, enum: ["user", "guest"], default: "user" },
    notes: { type: String, default: "" },
    stockRestoredAt: { type: Date },
    stockRestoredReason: { type: String, enum: ["cancelled", "failed"] },
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date },
    archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ archived: 1, createdAt: -1 });
OrderSchema.index(
  { idempotencyKey: 1 },
  {
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
    unique: true,
  },
);

const existingModel = mongoose.models.Order;

if (existingModel) {
  const hasArchived = existingModel.schema.path("archived");
  const hasVariantLabel = existingModel.schema.path("items.variantLabel");
  const hasIdempotencyKey = existingModel.schema.path("idempotencyKey");
  const hasStockRestoredAt = existingModel.schema.path("stockRestoredAt");
  if (
    !hasArchived ||
    !hasVariantLabel ||
    !hasIdempotencyKey ||
    !hasStockRestoredAt
  ) {
    delete mongoose.models.Order;
  }
}

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
