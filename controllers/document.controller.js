import Document from "../models/document.model.js";
import Driver from "../models/driver.model.js";
import Vendor from "../models/vendor.model.js";

// 🟢 Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { driverId, docType } = req.body;
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
    const documents = await Document.find({ vendorId: req.user.id })
      .populate("driverId", "name")
      .sort({ uploadDate: -1 });

    res.json({ documents });
  } catch (err) {
    console.error("❌ getMyDocuments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
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
