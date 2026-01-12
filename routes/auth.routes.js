const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const {
  isWithinShift,
  minutesUntil,
  getShiftEndDate
} = require("../utils/time.utils");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* =========================================================
   CAPTIVE PORTAL LOGIN (VERCEL FRONTEND)
   ========================================================= */
router.post("/captive/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.json({ status: "rejected" });
    }

    const student = await Student.findOne({ mobile });
    if (!student) return res.json({ status: "rejected" });

    const ok = await bcrypt.compare(password, student.password);
    if (!ok) return res.json({ status: "rejected" });

    const activeShift = isWithinShift(student.shifts);
    if (!activeShift) {
      return res.json({ status: "outside_shift" });
    }

    student.isActive = true;
    student.activeMac = null; // 🔥 router will attach
    student.shiftEndTime = getShiftEndDate(activeShift.end);
    student.lastSeen = new Date();

    await student.save();

    return res.json({ status: "approved" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error" });
  }
});



/* =========================================================
   NORMAL APP LOGIN (NOT USED BY ROUTER)
   ========================================================= */
router.post("/login", async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    const student = await Student.findOne({ mobile });
    if (!student) return res.json({ success: false });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.json({ success: false });

    if (student.isActive) {
      return res.json({
        success: false,
        message: "Already logged in"
      });
    }

    const activeShift = isWithinShift(student.shifts);
    if (!activeShift) {
      return res.json({
        success: false,
        message: "Outside allowed time"
      });
    }

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    student.isActive = true;
    student.activeToken = token;
    student.lastSeen = new Date();
    await student.save();

    return res.json({
      success: true,
      token,
      timeLeft: minutesUntil(activeShift.end) + " min"
    });

  } catch (err) {
    return next(err);
  }
});

/* =========================================================
   LOGOUT (IMPORTANT CLEANUP)
   ========================================================= */
router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const student = req.student;

    student.isActive = false;
    student.activeToken = null;
    student.activeMac = null;       // 🔥 REQUIRED
    student.shiftEndTime = null;    // 🔥 REQUIRED
    student.lastSeen = new Date();

    await student.save();

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
