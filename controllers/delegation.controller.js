import Vendor from "../models/vendor.model.js";

export const grantDelegation = async (req, res) => {
  try {
    const { toVendorId, allowedActions } = req.body;
    const superVendor = await Vendor.findById(req.user.id);

    if (superVendor.role !== "SuperVendor")
      return res.status(403).json({ error: "Only SuperVendor can delegate" });

    const subVendor = await Vendor.findById(toVendorId);
    if (!subVendor) return res.status(404).json({ error: "SubVendor not found" });

    subVendor.delegatedRights = allowedActions;
    await subVendor.save();

    res.json({ message: "Delegation granted", subVendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
