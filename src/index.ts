import "dotenv/config";
import { connectToMongoDB } from "./config/mongodbConfig";
import app from "./app";

const PORT = process.env.PORT || 4000;

connectToMongoDB();

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
