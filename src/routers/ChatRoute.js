"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateToken_1 = require("../middleware/validateToken");
const ChatController_1 = __importDefault(require("../controller/ChatController"));
const router = express_1.default.Router();
router.get("/", validateToken_1.jwtParse, ChatController_1.default.getUserChats);
exports.default = router;
