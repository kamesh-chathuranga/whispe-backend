import jwt from "jsonwebtoken";
import ms from "ms";

export const generateJWTToken = (
  userId: string,
  email: string,
  type: "ACCESS" | "REFRESH"
) => {
  const payload = { userId, email };

  const SECRET =
    type === "ACCESS"
      ? process.env.JWT_ACCESS_TOKEN_SECRET
      : process.env.JWT_REFRESH_TOKEN_SECRET;

  if (!SECRET) {
    throw new Error("JWT secret is not defined in environment variables.");
  }

  const EXPIRATION_TIME =
    type === "ACCESS"
      ? (process.env.ACCESS_TOKEN_EXPIRATION as ms.StringValue)
      : (process.env.REFRESH_TOKEN_EXPIRATION as ms.StringValue);

  const token = jwt.sign(payload, SECRET, {
    algorithm: "HS256",
    expiresIn: EXPIRATION_TIME,
    subject: "accessApi",
  });

  return token;
};
