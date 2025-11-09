import express from "express";
import Vehicle from "../models/vehicle.model.js";
import { authenticate } from "../config/auth.js";

const router = express.Router();

// 🟢 Create a new vehicle
router.post("/create", authenticate, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ message: "Vehicle created successfully", vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 Get all vehicles
router.get("/", authenticate, async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
