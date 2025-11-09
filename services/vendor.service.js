// Handles all vendor operations
// Demonstrates Encapsulation (vendor logic isolated here)
import Vendor from "../models/vendor.model.js";

export class VendorService {
  constructor(vendorData) {
    this.name = vendorData.name;
    this.address = vendorData.address;
    this.contactInfo = vendorData.contactInfo;
    this.role = vendorData.role || "SuperVendor";
    this.parentVendorId = vendorData.parentVendorId || null;
  }

  // Create a vendor (SuperVendor or SubVendor)
  async createVendor() {
    const vendor = new Vendor({
      name: this.name,
      address: this.address,
      contactInfo: this.contactInfo,
      role: this.role,
      parentVendorId: this.parentVendorId,
    });
    return await vendor.save();
  }

  // Get all vendors for dashboard
  static async getAllVendors() {
    return await Vendor.find().populate("parentVendorId", "name");
  }

  // Get sub-vendors of a SuperVendor
  static async getSubVendors(superVendorId) {
    return await Vendor.find({ parentVendorId: superVendorId });
  }
}
