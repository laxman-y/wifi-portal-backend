const express = require("express");
const router = express.Router();
const preauth = require("../src/state/preauthState"); // ✅ FIXED

router.post("/toggle-internet", (req, res) => {
  const state = preauth.toggle();

  res.json({
    success: true,
    preauth: state,
    message: state
      ? "Internet OPEN for all users"
      : "Captive Portal ENABLED"
  });
});

module.exports = router;
