const express = require("express");
const StudentV2 = require("../models/StudentV2");

const router = express.Router();

function nowMinutesIST() {
  const d = new Date(Date.now() + 5.5 * 3600000);
  return d.getHours() * 60 + d.getMinutes();
}

function shiftActive(shifts) {
  const now = nowMinutesIST();
  return shifts.some(s => {
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    const st = sh * 60 + sm;
    const en = eh * 60 + em;
    return st <= en ? now >= st && now <= en : now >= st || now <= en;
  });
}

router.get("/approved-macs", async (req, res) => {
  const students = await StudentV2.find({ mac: { $ne: null } });

  const macs = students
    .filter(s => shiftActive(s.shifts))
    .map(s => s.mac);

  res.json({ macs });
});

module.exports = router;
