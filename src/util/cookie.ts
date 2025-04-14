import { Response } from "express";

export const setAuthTokenInCookie = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("access_token", accessToken, {
    // domain: process.env.FRONTEND_URL,
    httpOnly: true,
    path: "/",
    maxAge: 15 * 60 * 1000, // 30 days
    sameSite: "lax",
  });

  res.cookie("refresh_token", refreshToken, {
    // domain: process.env.FRONTEND_URL,
    httpOnly: true,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "lax",
  });
};

export const clearAuthTokenFromCookie = (res: Response) => {
  res.clearCookie("access_token", {
    // domain: process.env.FRONTEND_URL,
    httpOnly: true,
    path: "/",
  });

  res.clearCookie("refresh_token", {
    // domain: process.env.FRONTEND_URL,
    httpOnly: true,
    path: "/",
  });
};
