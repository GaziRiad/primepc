import { getDiscountedPrice } from "@/lib/utils";
import { model, models, Schema } from "mongoose";
import slugify from "slugify";

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

    categories: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
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
});

ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });

const Product = models.Product || model("Product", ProductSchema);
export default Product;
