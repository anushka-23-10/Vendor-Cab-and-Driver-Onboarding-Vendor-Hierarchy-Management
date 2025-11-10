import fs from "fs";
import path from "path";
import Document from "../models/document.model.js";
import Driver from "../models/driver.model.js";
import Vehicle from "../models/vehicle.model.js";

/**
 * 📤 Upload Document (Driver or Vehicle)
 */
export const uploadDocument = async (req, res) => {
  try {
    const { ownerId, ownerType, type, issueDate, expiryDate } = req.body;
    const vendorId = req.user.vendorId || req.user.id;
    const file = req.file;

    console.log("📩 Incoming Document Upload:", {
      ownerId,
      ownerType,
      type,
      vendorId,
      file: file?.originalname,
    });

    // 🧱 Ensure upload directory exists
    const uploadDir = path.join("uploads", "documents");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 🧩 Validate
    if (!file) return res.status(400).json({ error: "File upload is required" });
    if (!ownerId || !ownerType || !type)
      return res.status(400).json({ error: "Missing required fields" });

    // 🔍 Validate owner belongs to vendor
    let owner;
    if (ownerType === "Driver") {
      owner = await Driver.findOne({ _id: ownerId, vendor: vendorId });
    } else if (ownerType === "Vehicle") {
      // Change "vendor" to "vendorId" if that's what your schema uses
      owner = await Vehicle.findOne({ _id: ownerId, vendor: vendorId });
    } else {
      return res.status(400).json({ error: "Invalid ownerType" });
    }

    if (!owner) {
      console.error(`❌ Owner not found or unauthorized for ${ownerType}`);
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    // 🧾 Save document
    const document = await Document.create({
      vendorId,
      ownerId,
      ownerType,
      type,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      filePath: `/uploads/documents/${file.filename}`,
      status: "Pending",
    });

    console.log("✅ Document added:", document._id);
    res
      .status(201)
      .json({ message: `${ownerType} document uploaded successfully`, document });
  } catch (err) {
    console.error("❌ uploadDocument error trace:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * 📋 Get all documents for the logged-in vendor
 */
export const getMyDocuments = async (req, res) => {
  try {
    const vendorId = req.user.vendorId || req.user.id;

    const documents = await Document.find({ vendorId })
      .populate("ownerId")
      .sort({ createdAt: -1 });

    const now = new Date();
    const updates = [];

    documents.forEach((doc) => {
      if (doc.expiryDate && new Date(doc.expiryDate) < now && doc.status !== "Expired") {
        doc.status = "Expired";
        updates.push(
          Document.updateOne({ _id: doc._id }, { $set: { status: "Expired" } })
        );
      }
    });

    if (updates.length) await Promise.all(updates);

    const formatted = documents.map((doc) => ({
      _id: doc._id,
      ownerType: doc.ownerType,
      ownerName:
        doc.ownerType === "Driver"
          ? doc.ownerId?.name
          : doc.ownerId?.registrationNumber || "Unknown",
      type: doc.type,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      status: doc.status,
      filePath: doc.filePath,
    }));

    res.json({ documents: formatted });
  } catch (err) {
    console.error("❌ getMyDocuments error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * 🧾 Approve or Reject document (SuperVendor only)
 */
export const verifyDocument = async (req, res) => {
  try {
    const { docId, status } = req.body;
    if (!["Approved", "Rejected"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    doc.status = status;
    await doc.save();

    res.json({ message: `Document ${status.toLowerCase()} successfully` });
  } catch (err) {
    console.error("❌ verifyDocument:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * 📊 Compliance Summary (SuperVendor)
 */
// 📊 Get overall compliance summary (for SuperVendor)
export const getComplianceSummary = async (req, res) => {
  try {
    if (req.user.role !== "SuperVendor")
      return res.status(403).json({ error: "Access denied" });

    const totalDocs = await Document.countDocuments();
    const approved = await Document.countDocuments({ status: "Approved" });
    const pending = await Document.countDocuments({ status: "Pending" });
    const rejected = await Document.countDocuments({ status: "Rejected" });
    const expired = await Document.countDocuments({ status: "Expired" });

    const complianceRate = totalDocs
      ? ((approved / totalDocs) * 100).toFixed(1)
      : 0;

    res.json({
      totalDocs,
      approved,
      pending,
      rejected,
      expired,
      complianceRate,
    });
  } catch (err) {
    console.error("❌ getComplianceSummary error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🧾 Get all documents across vendors (for SuperVendor)
export const getAllDocuments = async (req, res) => {
  try {
    if (req.user.role !== "SuperVendor")
      return res.status(403).json({ error: "Access denied" });

    const documents = await Document.find()
      .populate("vendorId", "name region")
      .populate("ownerId", "name licenseNumber registrationNumber")
      .sort({ createdAt: -1 });

    res.json({ documents });
  } catch (err) {
    console.error("❌ getAllDocuments error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const checkExpiredDocuments = async () => {
  try {
    const now = new Date();
    const result = await Document.updateMany(
      { expiryDate: { $lt: now }, status: { $ne: "Expired" } },
      { $set: { status: "Expired" } }
    );
    if (result.modifiedCount > 0)
      console.log(`⚠️ ${result.modifiedCount} documents marked as expired`);
  } catch (err) {
    console.error("❌ checkExpiredDocuments failed:", err.message);
  }
};
