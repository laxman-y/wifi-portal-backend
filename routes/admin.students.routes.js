const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

/* =========================================================
   CREATE STUDENT (ADMIN)
   ========================================================= */
router.post("/", adminAuth, async (req, res, next) => {
  try {
    const { name, mobile, password, activeMac, shifts } = req.body;

    if (!name || !mobile || !activeMac || !shifts?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const exists = await Student.findOne({ mobile });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student with this mobile already exists"
      });
    }

    const hashed = password
      ? await bcrypt.hash(password, 10)
      : null;

    await Student.create({
      name,
      mobile,
      password: hashed,
      activeMac: activeMac.toLowerCase(),
      shifts
    });

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

/* =========================================================
   LIST STUDENTS (ADMIN)
   ========================================================= */
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const students = await Student.find().select("-password");
    return res.json(students);
  } catch (err) {
    return next(err);
  }
});

/* =========================================================
   UPDATE STUDENT (ADMIN)
   ========================================================= */
router.put("/:id", adminAuth, async (req, res, next) => {
  try {
    const { shifts, password, activeMac } = req.body;

    const update = {};

    if (Array.isArray(shifts)) {
      update.shifts = shifts;
    }

    if (activeMac) {
      update.activeMac = activeMac.toLowerCase();
    }

    if (password && password.trim()) {
      update.password = await bcrypt.hash(password, 10);
    }

    await Student.findByIdAndUpdate(req.params.id, update);

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

/* =========================================================
   DELETE STUDENT (ADMIN)
   ========================================================= */
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
