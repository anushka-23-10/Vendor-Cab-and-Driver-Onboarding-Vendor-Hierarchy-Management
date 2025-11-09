import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  docType: {
    type: String,
    enum: ["Driving License", "RC", "Permit", "Pollution", "Insurance"],
    required: true,
  },
  filePath: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Expired"], default: "Pending" },
  uploadDate: { type: Date, default: Date.now },
  expiryDate: { type: Date }, // optional for compliance tracking
});

export default mongoose.model("Document", documentSchema);
