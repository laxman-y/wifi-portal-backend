const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema(
  {
    start: String, // "06:00"
    end: String    // "11:00"
  },
  { _id: false }
);

const StudentV2Schema = new mongoose.Schema(
  {
    name: String,
    mobile: { type: String, unique: true },

    // 🔥 AUTO-BINDED
    mac: { type: String, default: null, index: true },

    shifts: [ShiftSchema],

    // Attendance meta
    lastSeen: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentV2", StudentV2Schema);
