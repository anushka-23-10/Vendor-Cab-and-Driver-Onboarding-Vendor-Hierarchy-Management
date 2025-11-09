import express from "express";
import { grantDelegation } from "../controllers/delegation.controller.js";
import { authenticate } from "../config/auth.js";

const router = express.Router();
router.post("/grant", authenticate, grantDelegation);

export default router;
