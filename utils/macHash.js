const crypto = require("crypto");

function hashMac(mac) {
  return crypto
    .createHash("sha256")
    .update(mac.toLowerCase())
    .digest("hex");
}

module.exports = { hashMac };
