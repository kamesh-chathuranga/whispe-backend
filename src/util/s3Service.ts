import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { s3Config } from "../config/s3Config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AttachmentType } from "../model/Message";

const isProduction = process.env.NODE_ENV === "production";

const s3Client = new S3Client({
  region: s3Config.region,
  credentials: isProduction
    ? undefined
    : {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
});

export const generateUploadURL = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return url;
};

export const generateAccessURL = async (key: string, contentType: string) => {
  const command = new GetObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ResponseContentType: contentType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 1800 });
  return url;
};

export const mapMimeTypeToAttachmentType = (
  mimeType: string
): AttachmentType => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
};
