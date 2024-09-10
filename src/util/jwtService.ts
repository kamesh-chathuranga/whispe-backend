import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string) => {
  const payload = { userId };
  const SECRET = process.env.JWT_ACCESS_TOKEN_SECRET as string;
  const EXPIRATION_TIME = process.env.ACCESS_TOKEN_EXPIRATION as string;

  const token = jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: EXPIRATION_TIME,
    subject: "accessApi",
  });
  return token;
};

export const generateRefreshToken = (userId: string) => {
  const payload = { userId };
  const SECRET = process.env.JWT_REFRESH_TOKEN_SECRET as string;
  const EXPIRATION_TIME = process.env.REFRESH_TOKEN_EXPIRATION as string;

  const token = jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: EXPIRATION_TIME,
    subject: userId,
  });
  return token;
};
