const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

/* ===== IST HELPERS ===== */
function getISTMinutes() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.getHours() * 60 + ist.getMinutes();
}

function isShiftActive(shifts) {
  const nowMin = getISTMinutes();

  return shifts.some(s => {
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    // Normal shift
    if (start <= end) {
      return nowMin >= start && nowMin <= end;
    }

    // Overnight shift
    return nowMin >= start || nowMin <= end;
  });
}

/* ===== APPROVED MAC HASHES ===== */
router.get("/approved-macs", async (req, res) => {
  try {
    const students = await Student.find();

    const approvedHashes = students
      .filter(s => s.macHash && isShiftActive(s.shifts))
      .map(s => s.macHash);

    return res.json({
      success: true,
      macs: approvedHashes
    });
  } catch (err) {
    console.error("APPROVED MAC ERROR:", err);
    return res.status(500).json({ success: false });
  }
});


module.exports = router;
