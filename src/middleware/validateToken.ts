import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/UserModel";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cookies } = req;

  if (!cookies || !cookies.accessToken) {
    return res.status(401).json({ message: "ACCESS_TOKEN_NOT_VALID" });
  }

  try {
    const SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;
    const decode = jwt.verify(cookies.accessToken, SECRET) as jwt.JwtPayload;
    const userId = decode.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = user._id.toString();
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "ACCESS_TOKEN_NOT_VALID" });
  }
};
