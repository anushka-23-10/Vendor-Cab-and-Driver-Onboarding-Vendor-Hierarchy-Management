import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";

// 🟢 SuperVendor creates a new SubVendor
export const createSubVendor = async (req, res) => {
  try {
    const { name, address, contactInfo, parentVendorId } = req.body;

    if (req.user.role !== "SuperVendor")
      return res.status(403).json({ error: "Only SuperVendor can create sub-vendors" });

    const subVendor = await Vendor.create({
      name,
      address,
      contactInfo,
      parentVendorId,
      role: "SubVendor",
    });

    res.status(201).json({ message: "SubVendor created successfully", subVendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Get all vendors (SuperVendor Dashboard)
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("parentVendorId", "name");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
