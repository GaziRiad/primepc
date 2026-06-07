import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
    scope: { type: String, required: true },
  },
  {
    _id: false,
    versionKey: false,
  },
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit =
  mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);

export default RateLimit;
