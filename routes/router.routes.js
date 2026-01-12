const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

/* ===== ROUTER → BACKEND (ONE TIME) ===== */
router.post("/attach-mac", async (req, res) => {
  const { ip, mac } = req.body;
  if (!ip || !mac) return res.json({ ok: false });

  const student = await Student.findOne({
    isActive: true,
    pendingIp: ip
  });

  if (!student) return res.json({ ok: false });

  student.activeMac = mac.toLowerCase();
  student.pendingIp = null;
  await student.save();

  return res.json({ ok: true });
});


/* ===== ROUTER POLLING ===== */
router.get("/approved-macs", async (req, res) => {
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
});

module.exports = router;
