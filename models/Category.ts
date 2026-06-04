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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CategorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "categories",
});

CategorySchema.index({ isActive: 1, name: 1 });
CategorySchema.index({ updatedAt: -1 });

const Category = models.Category || model("Category", CategorySchema);
export default Category;
