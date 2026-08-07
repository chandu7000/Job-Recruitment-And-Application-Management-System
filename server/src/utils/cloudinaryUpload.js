import { Readable } from "node:stream";

import cloudinary from "../config/cloudinary.js";
import env from "../config/env.js";

const streamUpload = (
  buffer,
  options
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        );

      Readable.from(buffer).pipe(
        uploadStream
      );
    }
  );
};

export const uploadProfileImage =
  async (buffer, publicId) => {
    return streamUpload(buffer, {
      folder:
        env.cloudinary
          .profileImageFolder,
      public_id: publicId,
      resource_type: "image",
      overwrite: true
    });
  };

export const uploadResume =
  async (buffer, publicId) => {
    return streamUpload(buffer, {
      folder:
        env.cloudinary.resumeFolder,
      public_id: publicId,
      resource_type: "raw",
      overwrite: true
    });
  };

export const deleteCloudinaryAsset =
  async (
    publicId,
    resourceType = "image"
  ) => {
    return cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType
      }
    );
  };

export const uploadCompanyLogo =
  async (
    buffer,
    publicId
  ) => {
    return streamUpload(buffer, {
      folder:
        env.cloudinary
          .companyLogoFolder,

      public_id: publicId,
      resource_type: "image",
      overwrite: true
    });
  };