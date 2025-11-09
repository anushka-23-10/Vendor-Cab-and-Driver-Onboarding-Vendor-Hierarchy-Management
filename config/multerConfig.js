// config/multerConfig.js
import multer from "multer";
import path from "path";

// Define where and how files will be stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files go inside /uploads folder
  },
  filename: (req, file, cb) => {
    // Rename file as timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Only allow certain file types (like images, pdfs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Create Multer upload instance
export const upload = multer({ storage, fileFilter });
