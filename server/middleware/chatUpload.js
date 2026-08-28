import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { cloudinary } from "./upload.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "stackoverflow-clone/chat",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "avi", "webm"],
    resource_type: "auto",
  },
});

// Chat requirement: images and videos only, capped at 30MB per file.
const CHAT_MEDIA_LIMIT_BYTES = 30 * 1024 * 1024;

export const chatUpload = multer({
  storage,
  limits: { fileSize: CHAT_MEDIA_LIMIT_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image or video files are allowed in chat"));
    }
  },
});