import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { fileName, fileType, fileContent, userOmid } = req.body;

  if (!fileName || !fileType || !fileContent || !userOmid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${userOmid}-${fileName}`,
      Body: Buffer.from(fileContent, "base64"), // Decode base64 content
      ContentType: fileType,
    });

    await s3Client.send(command);

    const newImageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${userOmid}-${fileName}`;

    res.status(200).json({ imageUrl: newImageUrl });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
}