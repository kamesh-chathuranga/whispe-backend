import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectMongoDB } from "./config/dbConfig";

import UserRoute from "./routes/UserRoute";
import MessageRoute from "./routes/MessageRoute";

const PORT = process.env.PORT || 4000;
connectMongoDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/usesr", UserRoute);

app.use("/api/message", MessageRoute);

const server = app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
