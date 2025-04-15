import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
if (!ENCRYPTION_KEY) {
  throw new Error("Encryption key not found in environment variables");
}
const key = Buffer.from(ENCRYPTION_KEY, "base64");

export const encryptRefreshToken = (data: string) => {
  const iv = crypto.randomBytes(16); // Generate new IV for this encryption
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const result = iv.toString("hex") + ":" + encrypted;
  return result;
};

export const decryptRefreshToken = (encryptedData: string) => {
  const [ivHex, ciphertext] = encryptedData.split(":");
  if (!ivHex || !ciphertext) {
    throw new Error("Invalid data format: IV missing");
  }
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
