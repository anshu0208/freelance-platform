import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// ================= CLOUDINARY CONFIG =================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= SAFE FILE DELETE =================

const removeLocalFile = (filePath) => {
  try {

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

  } catch (error) {
    console.log(
      "Error deleting local file:",
      error.message
    );
  }
};

// ================= UPLOAD =================

const uploadOnCloudinary = async (
  localFilePath,
  folder = "freelancex"
) => {

  try {

    if (!localFilePath) {
      return null;
    }

    const response =
      await cloudinary.uploader.upload(
        localFilePath,
        {
          folder,

          resource_type: "auto",

          timeout: 60000,

          quality: "auto",

          fetch_format: "auto",
        }
      );

    // remove temp file
    removeLocalFile(localFilePath);

    console.log(
      "Cloudinary upload success:",
      response.secure_url
    );

    return response;

  } catch (error) {

    // cleanup temp file
    removeLocalFile(localFilePath);

    console.log(
      "Cloudinary upload failed:",
      error.message
    );

    return null;
  }
};

// ================= DELETE =================

const deleteFromCloudinary = async (
  publicId
) => {

  try {

    if (!publicId) {
      return null;
    }

    const result =
      await cloudinary.uploader.destroy(
        publicId
      );

    console.log(
      "Cloudinary delete success:",
      publicId
    );

    return result;

  } catch (error) {

    console.log(
      "Cloudinary delete failed:",
      error.message
    );

    return null;
  }
};

// ================= EXPORTS =================

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
};