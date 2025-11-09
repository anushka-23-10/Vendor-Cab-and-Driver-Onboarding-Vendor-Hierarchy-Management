import Document from "../models/document.model.js";
import Driver from "../models/driver.model.js";
import Vendor from "../models/vendor.model.js";

// 🟢 Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { driverId, docType, expiryDate } = req.body;
    const file = req.file;

    if (!driverId || !docType || !file)
      return res.status(400).json({ error: "Missing fields or file" });

    const driver = await Driver.findOne({
      _id: driverId,
      vendorId: req.user.id,
    });
    if (!driver)
      return res
        .status(403)
        .json({ error: "Driver not found or unauthorized" });

    const doc = await Document.create({
      driverId,
      vendorId: req.user.id,
      docType,
      filePath: `/uploads/${file.filename}`,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    res.status(201).json({ message: "Document uploaded successfully", doc });
  } catch (err) {
    console.error("❌ uploadDocument:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 📋 List documents for this vendor
export const getMyDocuments = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const docs = await Document.find({ vendorId })
      .populate("driverId", "name")
      .sort({ uploadDate: -1 });

    // ⚡ Auto-mark expired docs dynamically
    const today = new Date();
    const updates = [];

    docs.forEach((d) => {
      if (d.expiryDate && new Date(d.expiryDate) < today && d.status !== "Expired") {
        d.status = "Expired";
        updates.push(
          Document.updateOne({ _id: d._id }, { $set: { status: "Expired" } })
        );
      }
    });
    if (updates.length) await Promise.all(updates);

    res.json({ documents: docs });
  } catch (err) {
    console.error("❌ getMyDocuments:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// --- Optional Daily Cron Job (if you want scheduled updates) ---
export const autoExpireDocuments = async () => {
  const today = new Date();
  await Document.updateMany(
    { expiryDate: { $lt: today }, status: { $ne: "Expired" } },
    { $set: { status: "Expired" } }
  );
  console.log("✅ Auto-expired old documents");
};


// 🟠 For SuperVendor — approve/reject document
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

// 🧾 Fetch all documents for SuperVendor (includes vendor & driver)
export const getAllDocuments = async (req, res) => {
  try {
    if (req.user.role !== "SuperVendor")
      return res.status(403).json({ error: "Access denied" });

    const documents = await Document.find()
      .populate("vendorId", "name region")
      .populate("driverId", "name licenseNumber");

    res.json({ documents });
  } catch (err) {
    console.error("❌ getAllDocuments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🕓 Auto-update expired documents
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
    console.error("❌ Expiry check failed:", err.message);
  }
};
// 📊 Get Compliance Summary
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
    res.status(500).json({ error: "Internal server error" });
  }
};