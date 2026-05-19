import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

cartSchema.pre("validate", function () {
  const hasUser = !!this.user;
  const hasSession = !!this.sessionId;

  if (hasUser === hasSession)
    throw new Error("Cart must have either user or sessionId, but not both");
});

// one cart per logged-in user
cartSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $exists: true } } },
);

// one cart per guest session
cartSchema.index(
  { sessionId: 1 },
  { unique: true, partialFilterExpression: { sessionId: { $exists: true } } },
);

cartSchema.virtual("itemsCount").get(function () {
  return this.items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
