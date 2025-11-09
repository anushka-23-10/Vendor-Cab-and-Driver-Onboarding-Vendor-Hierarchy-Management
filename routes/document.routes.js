import express from "express";
import { uploadDocument, getDocumentsByOwner } from "../controllers/document.controller.js";
import { authenticate } from "../config/auth.js";
import { upload } from "../config/multerConfig.js";

const router = express.Router();

router.post("/upload", authenticate, upload.single("file"), uploadDocument);
router.get("/:ownerId", authenticate, getDocumentsByOwner);

export default router;
