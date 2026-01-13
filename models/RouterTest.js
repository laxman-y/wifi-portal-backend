const mongoose = require("mongoose");

const RouterTestSchema = new mongoose.Schema(
  {
    from: String,
    msg: String,
    ip: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RouterTest", RouterTestSchema);
