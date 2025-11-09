import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import bodyParser from "body-parser";
// import authRoutes from "./routes/auth.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import documentRoutes from "./routes/document.routes.js";
import { checkExpiredDocuments } from "./controllers/document.controller.js";
import path from "path";

dotenv.config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", vendorRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/documents", documentRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("Mongo Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/api/drivers", driverRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Check for expired documents every hour
setInterval(checkExpiredDocuments, 3600 * 1000);
