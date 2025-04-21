"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptRefreshToken = exports.encryptRefreshToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not found in environment variables");
}
const key = Buffer.from(ENCRYPTION_KEY, "base64");
const encryptRefreshToken = (data) => {
    const iv = crypto_1.default.randomBytes(16); // Generate new IV for this encryption
    const cipher = crypto_1.default.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    const result = iv.toString("hex") + ":" + encrypted;
    return result;
};
exports.encryptRefreshToken = encryptRefreshToken;
const decryptRefreshToken = (encryptedData) => {
    const [ivHex, ciphertext] = encryptedData.split(":");
    if (!ivHex || !ciphertext) {
        throw new Error("Invalid data format: IV missing");
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
exports.decryptRefreshToken = decryptRefreshToken;
