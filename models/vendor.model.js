// models/vendor.model.js
import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  contactInfo: String,
  // allowed vendor roles (top-level is SuperVendor but subvendors are restricted)
  role: {
    type: String,
    enum: ["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"],
    default: "SuperVendor",
  },
  parentVendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  // external identifier (this is required now)
  superVendorId: { type: String, required: true },
  delegationRights: {
    manageDrivers: { type: Boolean, default: true },
    manageVehicles: { type: Boolean, default: true },
    managePayments: { type: Boolean, default: false },
  },
}, { timestamps: true });

export default mongoose.model("Vendor", vendorSchema);
