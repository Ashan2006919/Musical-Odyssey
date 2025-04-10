import { S3Client, ListObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Conditionally load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config({ path: './.env.local' });
}

// Log environment variables to ensure they're loaded
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID || 'Not Loaded');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY || 'Not Loaded');
console.log('AWS_REGION:', process.env.AWS_REGION || 'Not Loaded');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME || 'Not Loaded');

// Set up the S3 client with the loaded environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Test the connection by listing the objects in the specified S3 bucket
async function listS3Objects() {
  try {
    const data = await s3Client.send(
      new ListObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME,
      })
    );
    console.log('S3 Bucket Objects:', data);
  } catch (err) {
    console.error('Error accessing S3:', err);
  }
}

// Function to upload a test image to the S3 bucket
async function uploadTestImage() {
  try {
    const filePath = path.resolve('public/images/default-profile.png'); // Replace with your test image path
    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'test-image.jpg', // The name of the file in the bucket
      Body: fileStream,
      ContentType: 'image/jpeg', // Adjust based on your file type
    };

    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('Image uploaded successfully:', data);
  } catch (err) {
    console.error('Error uploading image to S3:', err);
  }
}

// Call the functions to test S3 functionality
listS3Objects();
uploadTestImage();
