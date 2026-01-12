const express = require("express");
const crypto = require("crypto");
const Student = require("../models/Student");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

const macRegex = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

/* =========================================================
   CREATE STUDENT (ADMIN)
   ========================================================= */
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
        message: "Invalid MAC address format"
      });
    }

    const exists = await Student.findOne({ mobile });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student with this mobile already exists"
      });
    }

    const macHash = crypto
      .createHash("sha256")
      .update(mac.toLowerCase())
      .digest("hex");

    await Student.create({
      name,
      mobile,
      macHash,
      shifts
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("CREATE STUDENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/* =========================================================
   LIST STUDENTS (ADMIN)
   ========================================================= */
router.get("/", adminAuth, async (req, res) => {
  try {
    const students = await Student.find().select("-macHash");
    return res.json(students);
  } catch (err) {
    console.error("LIST STUDENTS ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

/* =========================================================
   UPDATE STUDENT (ADMIN)
   ========================================================= */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { mac, shifts } = req.body;
    const update = {};

    if (Array.isArray(shifts) && shifts.length) {
      update.shifts = shifts;
    }

    if (mac) {
      if (!macRegex.test(mac)) {
        return res.status(400).json({
          success: false,
          message: "Invalid MAC address format"
        });
      }

      update.macHash = crypto
        .createHash("sha256")
        .update(mac.toLowerCase())
        .digest("hex");
    }

    await Student.findByIdAndUpdate(req.params.id, update);
    return res.json({ success: true });
  } catch (err) {
    console.error("UPDATE STUDENT ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

/* =========================================================
   DELETE STUDENT (ADMIN)
   ========================================================= */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
