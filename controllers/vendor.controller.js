import { VendorService } from "../services/vendor.service.js";

// SuperVendor creates SubVendor
export const createSubVendor = async (req, res) => {
  try {
    const { name, address, contactInfo } = req.body;

    if (req.user.role !== "SuperVendor")
      return res.status(403).json({ error: "Only SuperVendor can create sub-vendors" });

    const vendorService = new VendorService({
      name,
      address,
      contactInfo,
      parentVendorId: req.user.id,
      role: "SubVendor",
    });

    const subVendor = await vendorService.createVendor();
    res.status(201).json({ message: "SubVendor created successfully", subVendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all vendors (SuperVendor Dashboard)
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await VendorService.getAllVendors();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
