const express = require("express");
const Student = require("../models/Student");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

const macRegex = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

/* ================= CREATE STUDENT ================= */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, mobile, mac, shifts } = req.body;

    if (!name || !mobile || !mac || !Array.isArray(shifts) || !shifts.length) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, MAC and shifts are required"
      });
    }

    if (!macRegex.test(mac)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MAC address"
      });
    }

    const exists = await Student.findOne({ mobile });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student already exists"
      });
    }

    await Student.create({
      name,
      mobile,
      mac: mac.toLowerCase(),
      shifts
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ================= LIST STUDENTS ================= */
router.get("/", adminAuth, async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

/* ================= UPDATE STUDENT ================= */
router.put("/:id", adminAuth, async (req, res) => {
  const update = {};
  const { mac, shifts } = req.body;

  if (mac) {
    if (!macRegex.test(mac)) {
      return res.status(400).json({ success: false, message: "Invalid MAC" });
    }
    update.mac = mac.toLowerCase();
  }

  if (Array.isArray(shifts)) {
    update.shifts = shifts;
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
