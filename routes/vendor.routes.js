import express from "express";
import { createSubVendor, getAllVendors } from "../controllers/vendor.controller.js";
import { authenticate } from "../config/auth.js";

const router = express.Router();

router.post("/create", authenticate, createSubVendor);
router.get("/all", authenticate, getAllVendors);

export default router;
