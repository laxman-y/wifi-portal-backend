const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,

  // 🔽 added for forgot password
  resetOTP: String,
  resetOTPExpiry: Date
});

module.exports = mongoose.model("Admin", AdminSchema);
