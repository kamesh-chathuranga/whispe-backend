import mongoose from "mongoose";

export const connectToMongoDB = async () => {
  const MONGODB_CONNECTING_URL = process.env.MONGODB_CONNECTING_URL;

  if (!MONGODB_CONNECTING_URL) {
    throw new Error("MongoDB connection string is not defined in .env file");
  }

  try {
    await mongoose.connect(MONGODB_CONNECTING_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Error connecting to the db: " + error);
  }
};
