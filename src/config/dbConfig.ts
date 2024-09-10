import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTING_URL as string);
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};
