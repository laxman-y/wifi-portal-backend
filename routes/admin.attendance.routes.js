const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/StudentV2");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

/* =====================================================
   ADMIN: GET ATTENDANCE WITH STUDENT NAME (FIXED)
   ===================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1 });

    const students = await Student.find().select("name mac");

    /* 🔥 NORMALIZE MAC → NAME MAP */
    const macToName = {};
    students.forEach(s => {
      if (s.mac) {
        macToName[s.mac.trim().toLowerCase()] = s.name.trim();
      }
    });

    const result = attendance.map(a => {
      const normalizedMac = a.mac?.trim().toLowerCase();

      return {
        _id: a._id,
        mac: a.mac,
        name: macToName[normalizedMac] || "Unknown",
        date: a.date,
        entries: a.entries
      };
    });

    res.json(result);
  } catch (err) {
    console.error("ADMIN ATTENDANCE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
