const express = require("express");
const Student = require("../models/Student");

const router = express.Router();

/* ================= TIME HELPERS ================= */
function getISTNow() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000);
}

function getShiftEndUTC(endTime) {
  const nowIST = getISTNow();
  const [eh, em] = endTime.split(":").map(Number);

  const end = new Date(nowIST);
  end.setHours(eh, em, 0, 0);

  // overnight shift
  if (end < nowIST) {
    end.setDate(end.getDate() + 1);
  }

  // convert IST → UTC
  return new Date(end.getTime() - 5.5 * 60 * 60 * 1000);
}

function getActiveShift(shifts) {
  const nowIST = getISTNow();
  const nowMin = nowIST.getHours() * 60 + nowIST.getMinutes();

  for (const s of shifts) {
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (
      (start <= end && nowMin >= start && nowMin <= end) ||
      (start > end && (nowMin >= start || nowMin <= end))
    ) {
      return s;
    }
  }
  return null;
}

/* ================= APPROVED MACS ================= */
router.get("/approved-macs", async (req, res) => {
  try {
    const students = await Student.find();

    const macs = [];

    for (const s of students) {
      const activeShift = getActiveShift(s.shifts);
      if (!activeShift) continue;

      const until = getShiftEndUTC(activeShift.end);

      // ❗ extra safety
      if (until <= new Date()) continue;

      macs.push({
        hash: s.macHash,
        until
      });
    }

    return res.json({ success: true, macs });
  } catch (err) {
    console.error("APPROVED MAC ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
