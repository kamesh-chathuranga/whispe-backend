import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { s3Config } from "../config/s3Config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});

export const generateUploadURL = async (key: string, contentType: string) => {
  const command = new PutObjectCommand({
    Bucket: s3Config.bucketName,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
};
