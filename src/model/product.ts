import mongoose, { InferSchemaType } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: {
      type: Array,
      required: true,
    },
    color: {
      type: Array,
    },
    rating: [
      {
        star: Number,
        comment: String,
        postBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    avarageRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export type Product = InferSchemaType<typeof productSchema>;
const Product = mongoose.model("Product", productSchema);

export default Product;
