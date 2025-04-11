import { Response } from "express";

export const setRefreshTokenInCookie = (res: Response, token: string) => {
  return res.cookie("refresh_token", token, {
    domain: process.env.FRONTEND_URL,
    httpOnly: true,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "strict",
  });
};

export const clearRefreshTokenFromCookie = (res: Response) => {
  return res.clearCookie("refresh_token", {
    domain: process.env.FRONTEND_URL,
    httpOnly: true,
    path: "/",
  });
};
