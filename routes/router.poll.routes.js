const express = require("express");
const router = express.Router();
const preauth = require("../src/state/preauthState"); // ✅ FIXED

router.get("/preauth-status", (req, res) => {
  res.json({
    preauth: preauth.get()
  });
});

module.exports = router;
