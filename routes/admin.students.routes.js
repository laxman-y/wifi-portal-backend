const express = require("express");
const Student = require("../models/StudentV2");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

const macRegex = /^([0-9a-f]{2}:){5}[0-9a-f]{2}$/i;

/* ================= CREATE STUDENT ================= */
router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      name,
      mobile,
      mac,
      shifts,
      batchNo
    } = req.body;

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

    const exists = await Student.findOne({
      mac: mac.toLowerCase()
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student already exists"
      });
    }

    await Student.create({
      name,
      mobile: mobile?.trim() || "",
      mac: mac.toLowerCase(),
      shifts,
      batchNo
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false
    });
  }
});

/* ================= LIST STUDENTS ================= */
router.get("/", adminAuth, async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ createdAt: -1 });

    res.json(students);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false
    });
  }
});

/* ================= UPDATE STUDENT ================= */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const update = {};

    const {
      mobile,
      mac,
      shifts,
      batchNo
    } = req.body;

    /* MOBILE */
    if (mobile !== undefined) {
      update.mobile = mobile.trim();
    }

    /* MAC */
    if (mac) {
      if (!macRegex.test(mac)) {
        return res.status(400).json({
          success: false,
          message: "Invalid MAC"
        });
      }

      update.mac = mac.toLowerCase();
    }

    /* SHIFTS */
    if (Array.isArray(shifts)) {
      if (shifts.some(s => !s.start || !s.end)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shift data"
        });
      }

      update.shifts = shifts;
    }

    /* BATCH */
    if (batchNo !== undefined) {
      update.batchNo = batchNo;
    }

    await Student.findByIdAndUpdate(
      req.params.id,
      update
    );

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});

/* ================= DELETE STUDENT ================= */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;
