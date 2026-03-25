import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Prevent duplicates (same user favoriting same product twice)
FavoriteSchema.index({ user: 1, product: 1 }, { unique: true });

const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;
