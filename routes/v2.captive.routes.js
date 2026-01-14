const express = require("express");
const bcrypt = require("bcryptjs");
const StudentV2 = require("../models/StudentV2");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const student = await StudentV2.findOne({ mobile });
    if (!student) return res.status(401).send("Invalid");

    const ok = await bcrypt.compare(password, student.password);
    if (!ok) return res.status(401).send("Invalid");

    // 🔥 ROUTER ADDS MAC
    const mac = req.headers["x-client-mac"];
    if (!mac) return res.status(400).send("MAC missing");

    // 🔐 Bind MAC ONCE
    if (!student.mac) {
      student.mac = mac.toLowerCase();
      student.lastSeen = new Date();
      await student.save();
    }

    res.send("OK");
  } catch (e) {
    res.status(500).send("Error");
  }
});

module.exports = router;
