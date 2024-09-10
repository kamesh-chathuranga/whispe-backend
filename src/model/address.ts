import mongoose, { InferSchemaType } from "mongoose";

const addressSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
});

export type Address = InferSchemaType<typeof addressSchema>;
const Address = mongoose.model("Address", addressSchema);

export default Address;
