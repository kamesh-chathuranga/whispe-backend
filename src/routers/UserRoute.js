"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = __importDefault(require("../controller/UserController"));
const validateToken_1 = require("../middleware/validateToken");
const router = express_1.default.Router();
router.get("/me", validateToken_1.jwtParse, UserController_1.default.getUserById);
router.get("/", validateToken_1.jwtParse, UserController_1.default.getAllUsers);
exports.default = router;
