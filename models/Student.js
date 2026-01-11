const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true }
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    name: String,
    mobile: { type: String, unique: true, index: true },
    password: String,
    shifts: [ShiftSchema],

    /* ===== CAPTIVE PORTAL FIELDS ===== */
    isActive: { type: Boolean, default: false, index: true },
    pendingIp: { type: String, default: null, index: true }, // 🔥 NEW
    activeMac: { type: String, default: null, index: true },
    shiftEndTime: { type: Date, default: null, index: true },

    lastSeen: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
