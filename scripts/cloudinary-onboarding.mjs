import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local",
  );
  process.exit(1);
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

const SAMPLE_URL = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

async function main() {
  const uploadResult = await cloudinary.uploader.upload(SAMPLE_URL);
  console.log("secure_url:", uploadResult.secure_url);
  console.log("public_id:", uploadResult.public_id);

  const details = await cloudinary.api.resource(uploadResult.public_id);
  console.log("width:", details.width);
  console.log("height:", details.height);
  console.log("format:", details.format);
  console.log("bytes:", details.bytes);

  const transformedUrl = cloudinary.url(uploadResult.public_id, {
    secure: true,
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });
  console.log("transformed_url:", transformedUrl);

  console.log("Cloudinary onboarding completed successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
