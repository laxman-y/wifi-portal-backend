// routes/admin.attendance.routes.js
const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });

    const students = await Student.find().select("name mac");

    // Build MAC → NAME map
    const macToName = {};
    students.forEach(s => {
      if (s.mac) {
        macToName[s.mac.toLowerCase()] = s.name;
      }
    });

    const result = attendance.map(a => ({
      _id: a._id,
      mac: a.mac,
      name: macToName[a.mac.toLowerCase()] || "Unknown",
      date: a.date,
      entries: a.entries
    }));

    res.json(result);
  } catch (err) {
    console.error("ADMIN ATTENDANCE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
