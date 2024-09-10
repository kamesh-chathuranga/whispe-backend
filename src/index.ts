import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectMongoDB } from "./config/dbConfig";

import AuthRoute from "./routes/AuthRoute";
import UserRoute from "./routes/UserRoute";
import AdminRoute from "./routes/AdminRoute";
import ProductRoute from "./routes/ProductRoute";
import CategoryRoute from "./routes/CategoryRoute";

const PORT = process.env.PORT || 4000;
connectMongoDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoute);

app.use("/api/user", UserRoute);

app.use("/api/admin", AdminRoute);

app.use("/api/products", ProductRoute);

app.use("/api/category", CategoryRoute);

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
