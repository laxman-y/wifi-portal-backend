const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

/*
  Router polling API
  Returns all currently allowed MACs
*/
router.get("/allowed-macs", async (req, res) => {
  try {
    const now = new Date();

    const students = await Student.find({
      activeMac: { $exists: true, $ne: null },
      isActive: true,
      shiftEndTime: { $gt: now }
    }).select("activeMac shiftEndTime");

    const macs = students.map(s => ({
      mac: s.activeMac,
      until: s.shiftEndTime
    }));

    res.json({ macs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ macs: [] });
  }
});

module.exports = router;
