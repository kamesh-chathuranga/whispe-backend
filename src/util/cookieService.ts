import { Response } from "express";

export const setAuthTokenInCookie = (
  res: Response,
  refreshToken: string,
  accessToken: string
) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", refreshToken, {
    // domain: process.env.FRONTEND_URL,
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: isProduction ? "none" : "lax",
  });

  return res.cookie("accessToken", accessToken, {
    // domain: process.env.FRONTEND_URL,
    httpOnly: true,
    secure: isProduction,
    path: "/",
    maxAge: 15 * 60 * 1000, // 15 Min
    sameSite: isProduction ? "none" : "lax",
  });
};

export const clearAuthTokenFromCookie = (res: Response) => {
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
