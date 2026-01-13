const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // "06:00"
    end:   { type: String, required: true }  // "11:00"
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true },
    mobile: { type: String, required: true },

    // ✅ PLAIN MAC (final decision)
    mac: { type: String, required: true, lowercase: true },

    shifts: { type: [ShiftSchema], default: [] },

    lastSeen: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
