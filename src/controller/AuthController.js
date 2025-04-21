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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = require("../model/UserModel");
const jwtService_1 = require("../util/jwtService");
const encryptionService_1 = require("../util/encryptionService");
const cookie_1 = require("../util/cookie");
const registerCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const existingUser = yield UserModel_1.User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User is already exists" });
        }
        const user = new UserModel_1.User(req.body);
        yield user.save();
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to create new user" });
    }
});
const logInCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const foundUser = yield UserModel_1.User.findOne({ email });
        if (!foundUser) {
            return res
                .status(401)
                .json({ message: "Incorrect userName or password" });
        }
        const isPasswordMatch = yield foundUser.isPasswordMatch(password);
        if (!isPasswordMatch) {
            return res
                .status(401)
                .json({ message: "Incorrect userName or password" });
        }
        const accessToken = (0, jwtService_1.generateJWTToken)(foundUser._id.toString(), email, "ACCESS");
        const refreshToken = (0, jwtService_1.generateJWTToken)(foundUser._id.toString(), email, "REFRESH");
        const encryptedRefreshToken = (0, encryptionService_1.encryptRefreshToken)(refreshToken);
        foundUser.refreshToken = encryptedRefreshToken;
        yield foundUser.save();
        (0, cookie_1.clearAuthTokenFromCookie)(res);
        (0, cookie_1.setAuthTokenInCookie)(res, encryptedRefreshToken, accessToken);
        res.status(200).json(Object.assign({}, foundUser.toJSON()));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to login user" });
    }
});
const logOutCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies;
        if (!cookie || !cookie.refreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }
        const refreshToken = cookie.refreshToken;
        const user = yield UserModel_1.User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        (0, cookie_1.clearAuthTokenFromCookie)(res);
        user.refreshToken = null;
        yield user.save();
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to logout user" });
    }
});
const validateRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookie = req.cookies;
        const encryRefreshToken = cookie.refreshToken;
        if (!cookie || !encryRefreshToken) {
            return res.status(401).json({ message: "Refresh token required" });
        }
        const user = yield UserModel_1.User.findOne({ refreshToken: encryRefreshToken });
        if (!user) {
            (0, cookie_1.clearAuthTokenFromCookie)(res);
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const refreshToken = (0, encryptionService_1.decryptRefreshToken)(encryRefreshToken);
        const SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
        jsonwebtoken_1.default.verify(refreshToken, SECRET, (error, decoded) => {
            const userId = user._id.toString();
            if (error || decoded.userId !== userId) {
                (0, cookie_1.clearAuthTokenFromCookie)(res);
                return res.status(403).json({ message: "Invalid refresh token" });
            }
            const accessToken = (0, jwtService_1.generateJWTToken)(userId, user.email, "ACCESS");
            (0, cookie_1.clearAuthTokenFromCookie)(res);
            (0, cookie_1.setAuthTokenInCookie)(res, encryRefreshToken, accessToken);
            return res.status(200).json();
        });
    }
    catch (error) {
        console.log(error);
        (0, cookie_1.clearAuthTokenFromCookie)(res);
        res.status(500).json({ message: "Failed to validate refresh token" });
    }
});
exports.default = {
    registerCurrentUser,
    logInCurrentUser,
    logOutCurrentUser,
    validateRefreshToken,
};
