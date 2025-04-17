import "dotenv/config";
import { connectToMongoDB } from "./config/mongodbConfig";
import { httpServer } from "./app";

const PORT = process.env.PORT || 4000;

connectToMongoDB();

httpServer.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});
