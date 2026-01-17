const mongoose = require("mongoose");

const StudentV2Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // 🔐 silently bound
    mac: { type: String, required: true, unique: true },

    shifts: [
      {
        start: String, // "06:00"
        end: String    // "11:00"
      }
    ],

    lastSeen: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentV2", StudentV2Schema);
