const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { sendOTP } = require("../utils/email");

const router = express.Router();

/* ================= ADMIN LOGIN ================= */
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res.status(401).json({ success: false });
    }

    const token = jwt.sign(
      { role: "admin", id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({ success: true, token });
  } catch (err) {
    return next(err);
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin email not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    admin.resetOTP = otp;
    admin.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    await admin.save();

    /* 🔑 IMPORTANT FIX:
       Respond immediately to avoid timeout */
    res.json({ success: true });

    /* 🔑 Send email AFTER response (non-blocking) */
    setImmediate(async () => {
      try {
        await sendOTP(email, otp);
      } catch (err) {
        console.error("OTP email failed:", err.message);
      }
    });

  } catch (err) {
    return next(err);
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });
    if (
      !admin ||
      admin.resetOTP !== otp ||
      admin.resetOTPExpiry < Date.now()
    ) {
      return res.status(400).json({ success: false });
    }

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || admin.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ success: false });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetOTP = null;
    admin.resetOTPExpiry = null;

    await admin.save();

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

/* ================= TEST ROUTE ================= */
router.get("/test", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
