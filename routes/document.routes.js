import express from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  uploadDocument,
  getMyDocuments,
  verifyDocument,
} from "../controllers/document.controller.js";

const router = express.Router();

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// 📤 Upload document
router.post("/upload", authenticate, upload.single("file"), uploadDocument);

// 📋 Get documents of current vendor
router.get("/my", authenticate, getMyDocuments);

// 🧾 Approve/reject (SuperVendor only)
router.post("/verify", authenticate, verifyDocument);

export default router;
