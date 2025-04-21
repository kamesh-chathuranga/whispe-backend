"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FriendRequestController_1 = __importDefault(require("../controller/FriendRequestController"));
const validateToken_1 = require("../middleware/validateToken");
const router = express_1.default.Router();
router.post("/", validateToken_1.jwtParse, FriendRequestController_1.default.sendFriendRequest);
router.get("/sent", validateToken_1.jwtParse, FriendRequestController_1.default.getSentFriendRequests);
router.get("/received", validateToken_1.jwtParse, FriendRequestController_1.default.getReceivedFriendRequests);
router.delete("/:requestId/cancel", validateToken_1.jwtParse, FriendRequestController_1.default.cancelFriendRequest);
router.post("/:requestId/accept", validateToken_1.jwtParse, FriendRequestController_1.default.acceptFriendRequest);
exports.default = router;
