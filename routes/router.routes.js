const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

/**
 * Router polls this endpoint
 * Returns all currently allowed MACs
 */
router.get("/approved-macs", async (req, res) => {
  try {
    const now = new Date();

    const students = await Student.find({
      isActive: true,
      activeMac: { $ne: null },
      shiftEndTime: { $gt: now }
    }).select("activeMac shiftEndTime");

    return res.json({
      success: true,
      macs: students.map(s => ({
        mac: s.activeMac,
        until: s.shiftEndTime
      }))
    });
  } catch (err) {
    console.error("Router poll error:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
