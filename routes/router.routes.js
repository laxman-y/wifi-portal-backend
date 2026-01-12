const express = require("express");
const Student = require("../models/Student");
const { isNowInAnyShift } = require("../utils/time.utils");
const { hashMac } = require("../utils/macHash");

const router = express.Router();

/**
 * Router polls this
 * Returns MACs that are allowed RIGHT NOW
 */
router.get("/approved-macs", async (req, res) => {
  try {
    const students = await Student.find();

    const allowed = students.filter(s =>
      isNowInAnyShift(s.shifts)
    );

    res.json({
      success: true,
      macs: allowed.map(s => s.macHash)
    });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
