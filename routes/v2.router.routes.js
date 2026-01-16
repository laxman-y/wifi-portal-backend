const express = require("express");
const StudentV2 = require("../models/StudentV2");

const router = express.Router();

function isShiftActive(shifts) {
  if (!shifts.length) return false;

  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();

  return shifts.some(s => {
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    const start = sh * 60 + sm;
    const end   = eh * 60 + em;

    return start <= end
      ? mins >= start && mins <= end
      : mins >= start || mins <= end;
  });
}

router.get("/approved-macs", async (req, res) => {
  const students = await StudentV2.find();

  const macs = students
    .filter(s => isShiftActive(s.shifts))
    .map(s => s.mac);

  res.json({ macs });
});

module.exports = router;
