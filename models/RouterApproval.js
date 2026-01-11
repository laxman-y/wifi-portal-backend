// models/RouterApproval.js
const mongoose = require("mongoose");

const routerApprovalSchema = new mongoose.Schema({
  mac: { type: String, unique: true },
  expiresAt: Date
});

module.exports = mongoose.model("RouterApproval", routerApprovalSchema);
