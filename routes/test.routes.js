// routes/test.routes.js
const express = require("express");
const router = express.Router();

router.post("/ping", (req, res) => {
  console.log("ROUTER POST RECEIVED:", req.body);
  res.json({
    success: true,
    received: req.body,
    time: new Date()
  });
});

module.exports = router;
