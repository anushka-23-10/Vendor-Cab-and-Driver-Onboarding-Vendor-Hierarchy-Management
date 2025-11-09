import express from "express";
import { uploadDocument, getDocuments, upload } from "../controllers/document.controller.js";
import { authenticate } from "../config/auth.js";

const router = express.Router();

router.post("/upload", authenticate, upload.single("file"), uploadDocument);
router.get("/:ownerId", authenticate, getDocuments);

export default router;
