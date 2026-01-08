const express = require("express");
const auth = require("../middleware/auth.middleware");
const { isWithinShift, minutesUntil } = require("../utils/time.utils");

const router = express.Router();

router.get("/status", auth, async (req, res, next) => {
  try {
    const student = req.student;

    const shift = isWithinShift(student.shifts);

    // SHIFT ENDED → FORCE LOGOUT
    if (!shift) {
      student.isActive = false;
      student.activeToken = null;
      await student.save();

      return res.json({
        active: false,
        reason: "SHIFT_ENDED"
      });
    }

    student.lastSeen = new Date();
    await student.save();

    return res.json({
      active: true,
      timeLeft: minutesUntil(shift.end)
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
