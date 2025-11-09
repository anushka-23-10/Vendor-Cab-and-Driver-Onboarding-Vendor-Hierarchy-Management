import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // DL, RC, Permit
  issueDate: Date,
  expiryDate: Date,
  filePath: String,
  ownerType: { type: String, enum: ["Driver", "Vehicle"], required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
});

export default mongoose.model("Document", documentSchema);
