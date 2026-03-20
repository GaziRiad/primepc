import { model, models, Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
    },

    image: {
      type: String,
      default: "",
      required: [true, "Category image is required"],
    },

    isActive: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now() },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Category = models.Category || model("Category", CategorySchema);
export default Category;
