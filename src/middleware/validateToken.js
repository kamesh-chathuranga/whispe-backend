"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtParse = void 0;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = require("../model/UserModel");
const jwtParse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { cookies } = req;
    if (!cookies || !cookies.accessToken) {
        return res.status(401).json({ message: "ACCESS_TOKEN_NOT_VALID" });
    }
    try {
        const decode = verifyAccessToken(cookies.accessToken);
        const userId = decode.userId;
        const user = yield UserModel_1.User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ message: "ACCESS_TOKEN_NOT_VALID" });
    }
});
exports.jwtParse = jwtParse;
function verifyAccessToken(token) {
    const SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
    return jsonwebtoken_1.default.verify(token, SECRET);
}
