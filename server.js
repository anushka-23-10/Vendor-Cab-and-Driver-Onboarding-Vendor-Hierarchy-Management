// CommonJS version (works on Render)
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const vendorRoutes = require("./routes/vendor.routes.js");
const driverRoutes = require("./routes/driver.routes.js");
const vehicleRoutes = require("./routes/vehicle.routes.js");
const documentRoutes = require("./routes/document.routes.js");
const { checkExpiredDocuments } = require("./controllers/document.controller.js");

dotenv.config();
const app = express();

// ===== Middleware =====
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


// ===== API Routes =====
app.use("/api/vendors", vendorRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/documents", documentRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.send("Vendor Onboarding API is running 🚀");
});

// ===== Mongo Connection =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));


// ===== Scheduler: Expired Docs =====
setInterval(checkExpiredDocuments, 3600 * 1000);


// ===== Server Listen =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on https://localhost:${PORT}`)
);
