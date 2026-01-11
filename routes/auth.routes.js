const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const { isWithinShift, minutesUntil } = require("../utils/time.utils");
const authMiddleware = require("../middleware/auth.middleware");
const RouterApproval = require("../models/RouterApproval");
// const { allowMac } = require("../utils/routerAuth");


const router = express.Router();



router.post("/captive/login", async (req, res) => {
  try {
    const { mobile, password, mac } = req.body;

    if (!mobile || !password || !mac) {
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

    const expiresAt = activeShift.end;

    /* ---- student session ---- */
    student.activeMac = mac.toLowerCase();
    student.isActive = true;
    student.shiftEndTime = expiresAt;
    student.lastSeen = new Date();
    await student.save();

    /* ---- router approval (CRITICAL) ---- */
    await RouterApproval.findOneAndUpdate(
      { mac: mac.toLowerCase() },
      { mac: mac.toLowerCase(), expiresAt },
      { upsert: true }
    );

    return res.json({
      status: "approved",
      sessionMinutes: minutesUntil(expiresAt)
    });

  } catch (err) {
    console.error("CAPTIVE LOGIN ERROR:", err);
    return res.status(500).json({ status: "error" });
  }
});


router.post("/login", async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    const student = await Student.findOne({ mobile });
    if (!student) {
      return res.json({ success: false });
    }

    const match = await bcrypt.compare(password, student.password);
    if (!match) {
      return res.json({ success: false });
    }

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

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
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
    return next(err); // handled by global error middleware
  }
});

/* ================= MANUAL LOGOUT ================= */
router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const student = req.student;

    // Strict single-session preserved:
    // Just end current session, NOT shift
    student.isActive = false;
    student.activeToken = null;
    student.lastSeen = new Date();

    await student.save();

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
