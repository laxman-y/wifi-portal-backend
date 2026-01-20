const express = require("express");
const Student = require("../models/StudentV2");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

const macRegex = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

/* ================= CREATE STUDENT ================= */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, mac, shifts, batchNo } = req.body;

    if (!name || !mac || !Array.isArray(shifts) || !shifts.length) {
      return res.status(400).json({
        success: false,
        message: "Name, MAC and at least one shift are required"
      });
    }

    if (!macRegex.test(mac)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MAC address"
      });
    }

    if (shifts.some(s => !s.start || !s.end)) {
      return res.status(400).json({
        success: false,
        message: "Each shift must have start and end time"
      });
    }

    const exists = await Student.findOne({ mac: mac.toLowerCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student already exists"
      });
    }

    await Student.create({
      name,
      mac: mac.toLowerCase(),
      shifts,
      batchNo // 🆕 added
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= LIST STUDENTS ================= */
router.get("/", adminAuth, async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

/* ================= UPDATE STUDENT ================= */
router.put("/:id", adminAuth, async (req, res) => {
  const update = {};
  const { mac, shifts, batchNo } = req.body;

  if (mac) {
    if (!macRegex.test(mac)) {
      return res.status(400).json({ success: false, message: "Invalid MAC" });
    }
    update.mac = mac.toLowerCase();
  }

  if (Array.isArray(shifts)) {
    if (shifts.some(s => !s.start || !s.end)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shift data"
      });
    }
    update.shifts = shifts;
  }

  if (batchNo !== undefined) {
    update.batchNo = batchNo; // 🆕 added
  }

  await Student.findByIdAndUpdate(req.params.id, update);
  res.json({ success: true });
});

/* ================= DELETE STUDENT ================= */
router.delete("/:id", adminAuth, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
