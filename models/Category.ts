import { model, models, Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de la catégorie est obligatoire"],
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Le slug de la catégorie est obligatoire"],
    },

    image: {
      type: String,
      default: "",
      required: [true, "L’image de la catégorie est obligatoire"],
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
