"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongodbConfig_1 = require("./config/mongodbConfig");
const app_1 = require("./app");
const PORT = process.env.PORT || 4000;
(0, mongodbConfig_1.connectToMongoDB)();
app_1.httpServer.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
});
