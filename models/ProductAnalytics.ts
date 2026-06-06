import mongoose from "mongoose";

const ProductAnalyticsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, default: "" },
    slug: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    finalPrice: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    addToCarts: { type: Number, default: 0 },
    addedToCartValue: { type: Number, default: 0 },
    checkoutStarts: { type: Number, default: 0 },
    checkoutStartItems: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    orderedUnits: { type: Number, default: 0 },
    orderedRevenue: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

ProductAnalyticsSchema.index({ date: 1, product: 1 }, { unique: true });
ProductAnalyticsSchema.index({ date: -1 });
ProductAnalyticsSchema.index({ views: -1 });
ProductAnalyticsSchema.index({ addToCarts: -1 });
ProductAnalyticsSchema.index({ checkoutStarts: -1 });
ProductAnalyticsSchema.index({ orders: -1 });
ProductAnalyticsSchema.index({ orderedRevenue: -1 });

const ProductAnalytics =
  mongoose.models.ProductAnalytics ||
  mongoose.model("ProductAnalytics", ProductAnalyticsSchema);

export default ProductAnalytics;
