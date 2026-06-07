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
      required: [true, "Product name is required"],
      trim: true, // removes white space at beginning and end of phrase
      maxLength: [
        40,
        "A Product name must have less or equal than 40 characters.",
      ],
      minLength: [
        10,
        "A Product name must have more or equal than 10 characters.",
      ],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
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
      required: [true, "Product price is required"],
      min: [100, "A Product price must be equal to 100DA or more."],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock must be 0 or greater."],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "discount must be between 0 and 100."],
      max: [100, "discount must be between 0 and 100."],
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
      required: [true, "Product coverimage is required"],
    },
    images: [String],
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    variants: { type: [productVariantSchema], default: [] },

    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
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

const existingModel = models.Product;

if (
  existingModel &&
  (!existingModel.schema.path("variants") ||
    !existingModel.schema.path("variants.active"))
) {
  delete models.Product;
}

const Product = models.Product || model("Product", ProductSchema);
export default Product;
