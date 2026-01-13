const express = require("express");
const RouterTest = require("../models/RouterTest");

const router = express.Router();

router.post("/ping", async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const doc = await RouterTest.create({
      from: req.body.from,
      msg: req.body.msg,
      ip
    });

    return res.json({
      success: true,
      saved: true,
      id: doc._id
    });
  } catch (err) {
    console.error("TEST SAVE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
