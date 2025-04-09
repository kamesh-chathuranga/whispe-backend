import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../../model/UserModel";

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
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access token not found" });
  }
  const token = authorization.split(" ")[1];

  try {
    const SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;
    const decoder = jwt.verify(token, SECRET) as jwt.JwtPayload;
    const userId = decoder.userId;
    const user = await User.findById<IUser>(userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = user.id;
    next();
  } catch (error) {
    console.log("Error: " + error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
