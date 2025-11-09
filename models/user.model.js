// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // stored as lowercase
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      "SuperVendor",
      "SubVendor",
      "RegionalVendor",
      "CityVendor",
      "LocalVendor",
      "Driver",
    ],
    required: true,
  },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  parentVendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
  isActive: { type: Boolean, default: false },
  activationToken: { type: String, default: null }, // optional token if you later add email activation
});

// NOTE: We will NOT hash inside this pre-save to avoid accidental double-hashing
// (we'll hash explicitly in controllers). If you prefer schema-level hashing,
// then remove manual hashing in controllers — but be consistent.
userSchema.pre("save", async function (next) {
  // only if password looks unhashed (very defensive)
  if (!this.isModified("password")) return next();
  // if password already looks like a bcrypt hash, skip
  if (typeof this.password === "string" && this.password.startsWith("$2")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
