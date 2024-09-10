import mongoose, { InferSchemaType } from "mongoose";

const cartItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: String,
});

const cartSchema = new mongoose.Schema({
  cartItems: [cartItemSchema],
});

export type Cart = InferSchemaType<typeof cartSchema>;
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
