import { getDiscountedPrice } from "@/lib/utils";
import { model, models, Schema } from "mongoose";
import slugify from "slugify";

const variantOptionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const productVariantSchema = new Schema({
  active: { type: Boolean, default: true },
  label: { type: String, required: true, trim: true },
  options: { type: [variantOptionSchema], default: [] },
  price: { type: Number, min: 100 },
  finalPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  image: { type: String, default: "" },
});

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom du produit est obligatoire"],
      trim: true, // removes white space at beginning and end of phrase
      maxLength: [
        40,
        "Le nom du produit doit contenir au maximum 40 caractères.",
      ],
      minLength: [
        10,
        "Le nom du produit doit contenir au moins 10 caractères.",
      ],
    },
    slug: {
      type: String,
      required: [true, "Le slug du produit est obligatoire"],
      unique: true,
    },
    brand: {
      type: String,
      default: "",
      lowercase: true, // This field will always be lowercased
    },
    description: { type: String, default: "" },
    price: {
      type: Number,
      required: [true, "Le prix du produit est obligatoire"],
      min: [100, "Le prix du produit doit être supérieur ou égal à 100 DA."],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Le stock doit être supérieur ou égal à 0."],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "La remise doit être comprise entre 0 et 100."],
      max: [100, "La remise doit être comprise entre 0 et 100."],
    },
    finalPrice: {
      type: Number,
      default: function (this) {
        return getDiscountedPrice(this.price, this.discount);
      },
    },
    coverImage: {
      type: String,
      default: "",
      required: [true, "L’image principale du produit est obligatoire"],
    },
    images: [String],
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    variants: { type: [productVariantSchema], default: [] },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    recommendedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    // Retained so existing products can be migrated when next saved.
    similarProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    accessoryProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    recommendationPriority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    topSeller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ProductSchema.pre("validate", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (Array.isArray(this.variants) && this.variants.length > 0) {
    for (const variant of this.variants) {
      variant.finalPrice = getDiscountedPrice(
        Number(variant.price ?? this.price),
        Number(this.discount ?? 0),
      );
    }

    this.stock = this.variants.reduce(
      (total, variant) =>
        total +
        (variant.active === false
          ? 0
          : Math.max(0, Number(variant.stock ?? 0))),
      0,
    );
  }
});

ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ finalPrice: 1 });
ProductSchema.index({ stock: 1, updatedAt: -1 });
ProductSchema.index({ updatedAt: -1 });
ProductSchema.index({ recommendationPriority: -1, stock: -1 });
ProductSchema.index({ topSeller: 1, stock: 1, updatedAt: -1 });
ProductSchema.index({
  categories: 1,
  stock: 1,
  recommendationPriority: -1,
  updatedAt: -1,
});
ProductSchema.index({ recommendedProducts: 1 });
ProductSchema.index({ similarProducts: 1 });
ProductSchema.index({ accessoryProducts: 1 });

const existingModel = models.Product;

if (
  existingModel &&
  (!existingModel.schema.path("variants") ||
    !existingModel.schema.path("variants.active") ||
    !existingModel.schema.path("recommendedProducts") ||
    !existingModel.schema.path("similarProducts") ||
    !existingModel.schema.path("accessoryProducts") ||
    !existingModel.schema.path("recommendationPriority") ||
    !existingModel.schema.path("topSeller"))
) {
  delete models.Product;
}

const Product = models.Product || model("Product", ProductSchema);
export default Product;
