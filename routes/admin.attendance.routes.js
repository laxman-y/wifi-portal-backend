// routes/admin.attendance.routes.js
const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/", adminAuth, async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });

    const students = await Student.find();

    const macToName = {};
    students.forEach(s => {
      macToName[s.macHash] = s.name;
    });

    const result = records.map(r => ({
      student: macToName[r.mac] || "Unknown",
      mac: r.mac,
      date: r.date,
      entries: r.entries
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
