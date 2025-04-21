"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJWTToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWTToken = (userId, email, type) => {
    const payload = { userId, email };
    const SECRET = type === "ACCESS"
        ? process.env.JWT_ACCESS_TOKEN_SECRET
        : process.env.JWT_REFRESH_TOKEN_SECRET;
    if (!SECRET) {
        throw new Error("JWT secret is not defined in environment variables.");
    }
    const EXPIRATION_TIME = type === "ACCESS"
        ? process.env.ACCESS_TOKEN_EXPIRATION
        : process.env.REFRESH_TOKEN_EXPIRATION;
    const token = jsonwebtoken_1.default.sign(payload, SECRET, {
        algorithm: "HS256",
        expiresIn: EXPIRATION_TIME,
        subject: "accessApi",
    });
    return token;
};
exports.generateJWTToken = generateJWTToken;
