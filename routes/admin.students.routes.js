const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const adminAuth = require("../middleware/admin.middleware");

const router = express.Router();

/* CREATE student */
router.post("/", adminAuth, async (req, res, next) => {
  try {
    const { name, mobile, password, shifts } = req.body;

    const exists = await Student.findOne({ mobile });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Student with this mobile already exists"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await Student.create({
      name,
      mobile,
      password: hash,
      shifts
    });

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

/* LIST students */
router.get("/", adminAuth, async (req, res, next) => {
  try {
    const students = await Student.find().select("-password");
    return res.json(students);
  } catch (err) {
    return next(err);
  }
});

/* UPDATE student */
router.put("/:id", adminAuth, async (req, res, next) => {
  try {
    const { shifts, password, isActive } = req.body;

    const update = { shifts, isActive };

    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    await Student.findByIdAndUpdate(req.params.id, update);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

/* DELETE student */
router.delete("/:id", adminAuth, async (req, res, next) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
