import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/UserModel";
import { generateJWTToken } from "../util/jwtService";
import { decryptData, encryptData } from "../util/encryptionService";
import {
  clearAuthTokenFromCookie,
  setAuthTokenInCookie,
} from "../util/cookie";

const registerCurrentUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User is already exists" });
    }

    const user = new User(req.body);
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create new user" });
  }
};

const logInCurrentUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res
        .status(401)
        .json({ message: "Incorrect userName or password" });
    }

    const isPasswordMatch = await foundUser.isPasswordMatch(password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect userName or password" });
    }

    const accessToken = generateJWTToken(
      foundUser._id.toString(),
      email,
      "ACCESS"
    );
    const refreshToken = generateJWTToken(
      foundUser._id.toString(),
      email,
      "REFRESH"
    );
    const encryptedRefreshToken = encryptData(refreshToken);
    foundUser.refreshToken = encryptedRefreshToken;

    await foundUser.save();

    clearAuthTokenFromCookie(res);
    setAuthTokenInCookie(res, accessToken, encryptedRefreshToken);

    res.status(200).json(foundUser.toJSON());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login user" });
  }
};

const logOutCurrentUser = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies;

    if (!cookie || !cookie.refresh_token) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const refreshToken = cookie.refresh_token;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    clearAuthTokenFromCookie(res);

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to logout user" });
  }
};

const validateRefreshToken = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies;

    if (!cookie || !cookie.refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const encryRefreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken: encryRefreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const refreshToken = decryptData(encryRefreshToken);

    const SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string;
    jwt.verify(refreshToken, SECRET, (error: any, decoded: any) => {
      const userId = user._id.toString();

      if (error || decoded.userId !== userId) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const accessToken = generateJWTToken(userId, user.email, "ACCESS");

      clearAuthTokenFromCookie(res);
      setAuthTokenInCookie(res, accessToken, encryRefreshToken);

      res.status(200);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to validate refresh token" });
  }
};

export default {
  registerCurrentUser,
  logInCurrentUser,
  logOutCurrentUser,
  validateRefreshToken,
};
