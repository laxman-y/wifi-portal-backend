const express = require("express");
const StudentV2 = require("../models/StudentV2");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { name, mac } = req.body;

    if (!name || !mac) {
      return res.status(400).json({ success: false });
    }

    const cleanMac = mac.toLowerCase().trim();

    // ✅ ONE MAC = ONE STUDENT (atomic + safe)
    const student = await StudentV2.findOneAndUpdate(
      { mac: cleanMac },                 // 🔑 UNIQUE KEY
      {
        $setOnInsert: {
          mac: cleanMac,
          name,
          shifts: []
        },
        $set: {
          lastSeen: new Date()
        }
      },
      {
        upsert: true,    // create if not exists
        new: true        // return updated doc
      }
    );

    return res.json({
      success: true,
      name: student.name
    });

  } catch (e) {
    console.error("V2 LOGIN ERROR:", e);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
