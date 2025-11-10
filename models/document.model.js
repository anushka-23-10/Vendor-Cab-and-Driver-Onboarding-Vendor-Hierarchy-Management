import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "ownerType", // Dynamic reference (Driver or Vehicle)
    },
    ownerType: {
      type: String,
      enum: ["Driver", "Vehicle"],
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["License", "Registration", "Insurance", "Pollution", "Permit"],
    },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Expired"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
