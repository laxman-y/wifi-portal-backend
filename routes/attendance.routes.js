const express = require("express");
const Attendance = require("../models/Attendance");

const router = express.Router();

/* ===== Helpers ===== */
function getISTDate() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10); // YYYY-MM-DD
}

/* ================= ENTRY ================= */
router.post("/entry", async (req, res) => {
  const { mac } = req.body;
  if (!mac) return res.json({ ok: false });

  const today = new Date().toISOString().slice(0, 10);

  let record = await Attendance.findOne({ mac, date: today });

  if (!record) {
    record = await Attendance.create({
      mac,
      date: today,
      entries: []
    });
  }

  const last = record.entries[record.entries.length - 1];

  // 🔥 CREATE NEW ENTRY ONLY IF LAST IS CLOSED
  if (!last || last.exitTime) {
    record.entries.push({ entryTime: new Date() });
    await record.save();
  }

  res.json({ ok: true });
});

/* ================= EXIT ================= */
router.post("/exit", async (req, res) => {
  const { mac } = req.body;
  if (!mac) return res.json({ ok: false });

  const today = new Date().toISOString().slice(0, 10);

  const record = await Attendance.findOne({ mac, date: today });
  if (!record) return res.json({ ok: false });

  const last = record.entries[record.entries.length - 1];

  // 🔥 CLOSE ONLY IF OPEN
  if (last && !last.exitTime) {
    last.exitTime = new Date();
    await record.save();
  }

  res.json({ ok: true });
});

module.exports = router;
