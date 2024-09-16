import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const createS3Client = async () => {
  const region = process.env.BUCKET_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_SECRET;
  const bucketName = process.env.BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("One or more required environment variables are missing");
  }

  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });

  return s3Client;
};

// Upload to S3
const uploadFile = async (file, folder) => {
  const s3Client = await createS3Client();
  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${folder}/${file.filename}`,
    Body: file.buffer,
  };
  return s3Client.send(new PutObjectCommand(uploadParams));
};

// Delete File from S3
const deleteFile = async (fileKey) => {
  const s3Client = await createS3Client(); 
  const deleteParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileKey,
  };
  return s3Client.send(new DeleteObjectCommand(deleteParams));
};

const getSignedURL = async (fileKey) => {
  const s3Client = await createS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: fileKey,
  });
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
};

export { uploadFile, deleteFile, getSignedURL };
