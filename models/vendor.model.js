import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const vendorSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  contactInfo: { type: String, required: true },
  region: { type: String, default: "Unassigned" },
  role: {
    type: String,
    enum: ["SuperVendor", "RegionalVendor", "CityVendor", "LocalVendor"],
    required: true,
  },
  parentVendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  isActive: { type: Boolean, default: false },
});

// 🧠 Hash password before saving (only if modified)
vendorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Password comparison method
vendorSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("Vendor", vendorSchema);
