import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../model/user";
import { generateAccessToken, generateRefreshToken } from "../util/jwtService";

const registerCurrentUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User is already exists" });
    }
    const user = new User(req.body);
    await user.save();

    res.status(201).json(user.toJSON());
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
    const accessToken = generateAccessToken(foundUser._id.toString());
    const refreshToken = generateRefreshToken(foundUser._id.toString());
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ data: foundUser.toJSON(), accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to login user" });
  }
};

const logOutCurrentUser = async (req: Request, res: Response) => {
  try {
    const cookie = req.cookies;

    if (!cookie || !cookie.refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });

    if (user) {
      user.refreshToken = "";
      await user.save();
    }
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
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string;
    jwt.verify(refreshToken, SECRET, (error: any, decoded: any) => {
      const userId = user._id.toString();

      if (error || decoded.userId !== userId) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }
      const accessToken = generateAccessToken(userId);
      res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  registerCurrentUser,
  logInCurrentUser,
  logOutCurrentUser,
  validateRefreshToken,
};
