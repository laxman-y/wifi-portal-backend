const express = require("express");
const StudentV2 = require("../models/StudentV2");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { name, mac } = req.body;

    if (!name || !mac) {
      return res.status(400).json({ success: false });
    }

    const cleanMac = mac.toLowerCase();

    // 🔒 Bind once per device
    let student = await StudentV2.findOne({ mac: cleanMac });

    if (!student) {
      student = await StudentV2.create({
        name,
        mac: cleanMac,
        shifts: []
      });
    }

    student.lastSeen = new Date();
    await student.save();

    return res.json({
      success: true,
      name: student.name
    });

  } catch (e) {
    console.error("V2 LOGIN ERROR:", e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
