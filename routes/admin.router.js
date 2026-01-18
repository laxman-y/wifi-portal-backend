const express = require("express");
const { runRouterCommand } = require("../utils/routerSSH");

const router = express.Router();

router.post("/toggle-internet", async (req, res) => {
  try {
    const result = await runRouterCommand("/usr/bin/toggle_preauth.sh");
    res.json({
      success: true,
      output: result.stdout || result.stderr
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
});

module.exports = router;
