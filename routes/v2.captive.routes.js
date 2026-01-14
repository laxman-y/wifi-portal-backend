const express = require("express");
const StudentV2 = require("../models/StudentV2");

const router = express.Router();

const macRegex = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

/**
 * V2 CAPTIVE LOGIN
 * ----------------
 * One-time silent MAC binding
 * Router sends MAC in header
 * No password, no mobile
 */
router.post("/login", async (req, res) => {
  try {
    // 1️⃣ MAC comes from router (preferred)
    let mac =
      req.headers["x-client-mac"] ||
      req.body.mac;

    const ip = req.body.ip || null;

    if (!mac || !macRegex.test(mac)) {
      return res.status(400).send("Invalid");
    }

    mac = mac.toLowerCase();

    // 2️⃣ Find or create student
    let student = await StudentV2.findOne({ mac });

    if (!student) {
      student = await StudentV2.create({
        mac,
        firstSeenAt: new Date(),
        lastSeen: new Date()
      });
    } else {
      student.lastSeen = new Date();
      await student.save();
    }

    // 3️⃣ Success
    return res.json({
      success: true,
      mac,
      ip
    });
  } catch (err) {
    console.error("V2 CAPTIVE LOGIN ERROR:", err);
    return res.status(500).send("Error");
  }
});

module.exports = router;
