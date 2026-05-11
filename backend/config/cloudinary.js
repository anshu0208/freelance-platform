import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ================= CLOUDINARY CONFIG =================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// ================= REMOVE LOCAL FILE =================

const removeLocalFile = (
  filePath
) => {
  try {

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }

  } catch (error) {

    console.error(
      "Local file delete failed:",
      error.message
    );
  }
};

// ================= UPLOAD =================

const uploadOnCloudinary = async (
  localFilePath,
  folder = "freelancex/gigs"
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

          quality: "auto",

          fetch_format: "auto",

          timeout: 60000,
        }
      );

    // remove temp file after upload
    removeLocalFile(localFilePath);

    // return only required fields
    return {
      url: response.secure_url,

      public_id:
        response.public_id,

      resource_type:
        response.resource_type,
    };

  } catch (error) {

    // cleanup temp file
    removeLocalFile(localFilePath);

    console.error(
      "Cloudinary upload failed:",
      error.message
    );

    return null;
  }
};

// ================= DELETE =================

const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {

  try {

    if (!publicId) {
      return null;
    }

    const result =
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type:
            resourceType,
        }
      );

    return result;

  } catch (error) {

    console.error(
      "Cloudinary delete failed:",
      error.message
    );

    return null;
  }
};

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
};