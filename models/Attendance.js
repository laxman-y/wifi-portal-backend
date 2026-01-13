const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    mac: { type: String, index: true },
    date: { type: String, index: true }, // YYYY-MM-DD (IST)

    entries: [
      {
        entryTime: Date,
        exitTime: Date
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
