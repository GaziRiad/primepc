import mongoose from "mongoose";

const emailEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    createdAt: { type: Date, required: true },
    detail: { type: String, default: "" },
  },
  { _id: false },
);

const EmailDeliverySchema = new mongoose.Schema(
  {
    providerId: { type: String },
    recipients: { type: [String], default: [] },
    subject: { type: String, default: "" },
    category: { type: String, default: "transactional", index: true },
    relatedId: { type: String, default: "", index: true },
    status: { type: String, required: true, index: true },
    lastError: { type: String, default: "" },
    lastEventAt: { type: Date, default: Date.now },
    events: { type: [emailEventSchema], default: [] },
  },
  { timestamps: true },
);

EmailDeliverySchema.index(
  { providerId: 1 },
  {
    partialFilterExpression: { providerId: { $type: "string" } },
    unique: true,
  },
);
EmailDeliverySchema.index({ createdAt: -1 });

const EmailDelivery =
  mongoose.models.EmailDelivery ||
  mongoose.model("EmailDelivery", EmailDeliverySchema);

export default EmailDelivery;
