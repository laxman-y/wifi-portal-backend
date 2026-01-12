const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

const macRegex = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

/* ================= CREATE STUDENT ================= */
router.post("/", adminAuth, async (req, res, next) => {
  try {
    const { name, mobile, password, activeMac, shifts } = req.body;

    if (!name || !mobile || !activeMac || !Array.isArray(shifts) || !shifts.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!macRegex.test(activeMac)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MAC address"
      });
    }

    const exists = await Student.findOne({ mobile });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student with this mobile already exists"
      });
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : null;

    await Student.create({
      name,
      mobile,
      password: hashedPassword,
      activeMac: activeMac.toLowerCase(),
      shifts,
      isActive: false   // 🔥 IMPORTANT
    });

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* ================= LIST STUDENTS ================= */
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (err) {
    next(err);
  }
});

/* ================= UPDATE STUDENT ================= */
router.put("/:id", adminAuth, async (req, res, next) => {
  try {
    const { shifts, password, activeMac } = req.body;
    const update = {};

    if (Array.isArray(shifts)) update.shifts = shifts;

    if (activeMac) {
      if (!macRegex.test(activeMac)) {
        return res.status(400).json({
          success: false,
          message: "Invalid MAC address"
        });
      }
      update.activeMac = activeMac.toLowerCase();
    }

    if (password && password.trim()) {
      update.password = await bcrypt.hash(password, 10);
    }

    await Student.findByIdAndUpdate(req.params.id, update);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* ================= DELETE STUDENT ================= */
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
