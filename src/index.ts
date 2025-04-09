import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { connectMongoDB } from "./config/dbConfig";

import UserRoute from "./routes/UserRoute";
import AuthRoute from "./routes/AuthRoute";
import MessageRoute from "./routes/MessageRoute";

const PORT = process.env.PORT || 4000;
connectMongoDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoute);

app.use("/api/user", UserRoute);

app.use("/api/message", MessageRoute);

const server = app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
