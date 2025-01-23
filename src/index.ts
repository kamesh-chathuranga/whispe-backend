import express from "express";
import cors from "cors";
import "dotenv/config";

import UserRoute from "./routes/UserRoute";
import MessageRoute from "./routes/MessageRoute";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", UserRoute);
app.use("/api/message", MessageRoute);

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});

global.onlineUsers = new Map<string, string>();
