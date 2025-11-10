import express from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  uploadDocument,
  getMyDocuments,
} from "../controllers/document.controller.js";

const router = express.Router();

// 🗂 Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/documents/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// 📤 Upload document
router.post("/upload", authenticate, upload.single("file"), uploadDocument);

// 📋 Get all documents for current vendor
router.get("/list", authenticate, getMyDocuments);

export default router;
