const mongoose = require("mongoose");

const StudentV2Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // 🔐 silently bound
    mac: { type: String, required: true, unique: true },

      // 🆕 Batch number (1, 2, 3, ...)
    batchNo: {
     type: String,
      required: false,   // keep optional to avoid breaking old data
      index: true        // useful for filtering later
    },

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
