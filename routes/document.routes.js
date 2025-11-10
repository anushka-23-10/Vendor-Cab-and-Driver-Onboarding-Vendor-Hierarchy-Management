import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  getComplianceSummary,
  verifyDocument,
} from "../controllers/document.controller.js";

const router = express.Router();

// 🗂 Ensure uploads folder exists
const uploadPath = path.join("uploads", "documents");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// 🧩 Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// 📤 Upload document (for vendor)
router.post("/upload", authenticate, upload.single("file"), uploadDocument);

// 📋 Get current vendor’s documents
router.get("/list", authenticate, getMyDocuments);

// 🧾 SuperVendor: Get all documents
router.get("/all", authenticate, getAllDocuments);

// 📊 SuperVendor: Compliance summary
router.get("/summary", authenticate, getComplianceSummary);

// ✅ Approve/Reject document
router.post("/verify", authenticate, verifyDocument);

export default router;
