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
  try {
    const { mac } = req.body;
    if (!mac) return res.json({ success: false });

    const today = getISTDate();

    let doc = await Attendance.findOne({ mac, date: today });

    if (!doc) {
      doc = await Attendance.create({
        mac,
        date: today,
        entries: [{ entryTime: new Date() }]
      });
    } else {
      const last = doc.entries[doc.entries.length - 1];
      if (!last || last.exitTime) {
        doc.entries.push({ entryTime: new Date() });
        await doc.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("ENTRY ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* ================= EXIT ================= */
router.post("/exit", async (req, res) => {
  try {
    const { mac } = req.body;
    if (!mac) return res.json({ success: false });

    const today = getISTDate();
    const doc = await Attendance.findOne({ mac, date: today });
    if (!doc) return res.json({ success: false });

    const last = doc.entries[doc.entries.length - 1];
    if (last && !last.exitTime) {
      last.exitTime = new Date();
      await doc.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("EXIT ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
