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
      return res.json({ status: "rejected", reason: "missing_fields" });
    }

    const student = await Student.findOne({ mobile });
    if (!student) {
      return res.json({ status: "rejected", reason: "invalid" });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.json({ status: "rejected", reason: "invalid" });
    }

    const activeShift = isWithinShift(student.shifts);
    if (!activeShift) {
      return res.json({ status: "rejected", reason: "outside_shift" });
    }

    /* MARK LOGIN REQUEST */
    student.isActive = true;
    student.lastSeen = new Date();
    student.shiftEndTime = activeShift.end;
    student.activeMac = null; // ← IMPORTANT
    await student.save();

    return res.json({
      status: "approved",
      wait: "router_will_attach_mac"
    });

  } catch (err) {
    console.error(err);
    return res.json({ status: "error" });
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
