"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthTokenFromCookie = exports.setAuthTokenInCookie = void 0;
const setAuthTokenInCookie = (res, refreshToken, accessToken) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
        // domain: process.env.FRONTEND_URL,
        httpOnly: true,
        secure: isProduction,
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: isProduction ? "strict" : "lax",
    });
    return res.cookie("accessToken", accessToken, {
        // domain: process.env.FRONTEND_URL,
        httpOnly: true,
        secure: isProduction,
        path: "/",
        maxAge: 15 * 60 * 1000, // 15 Min
        sameSite: isProduction ? "strict" : "lax",
    });
};
exports.setAuthTokenInCookie = setAuthTokenInCookie;
const clearAuthTokenFromCookie = (res) => {
    res.clearCookie("refreshToken", {
        // domain: process.env.FRONTEND_URL,
        httpOnly: true,
        path: "/",
    });
    return res.clearCookie("accessToken", {
        // domain: process.env.FRONTEND_URL,
        httpOnly: true,
        path: "/",
    });
};
exports.clearAuthTokenFromCookie = clearAuthTokenFromCookie;
