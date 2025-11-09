// routes/vendor.routes.js
import express from "express";
import { createSubVendor, getSubVendors, getMyVendor } from "../controllers/vendor.controller.js";
import authenticate from "../middleware/auth.middleware.js"; // make sure this file exists and exports default

const router = express.Router();

// create subvendor (only SuperVendor)
router.post("/create-subvendor", authenticate, createSubVendor);

// list direct subvendors under the logged-in super vendor
router.get("/my-subvendors", authenticate, getSubVendors);

// get current vendor record (useful for pre-filling superVendorId)
router.get("/me", authenticate, getMyVendor);

export default router;
