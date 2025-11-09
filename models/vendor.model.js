import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  contactInfo: String,
  parentVendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  role: { type: String, enum: ["SuperVendor", "SubVendor"], required: true },
  delegatedRights: [String],
});

export default mongoose.model("Vendor", vendorSchema);
