import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;

if (!ENCRYPTION_KEY) {
  throw new Error("Encryption key not found in environment variables");
}

const key = Buffer.from(ENCRYPTION_KEY, "base64");
const iv = crypto.randomBytes(16); // Initialization vector

export const encryptData = (data: string) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decryptData = (encryptedData: string) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
