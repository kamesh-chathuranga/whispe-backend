import express from "express";
import cors from "cors";
import "dotenv/config";

// import UserRoute from "./routes/UserRoute";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// app.use("/api/user", UserRoute);

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
