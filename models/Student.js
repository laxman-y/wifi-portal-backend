const mongoose = require("mongoose");

const ShiftSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true // "06:00"
    },
    end: {
      type: String,
      required: true // "11:00"
    }
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    shifts: {
      type: [ShiftSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: false
    },
    activeToken: {
      type: String,
      default: null
    },
    lastSeen: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

module.exports = mongoose.model("Student", StudentSchema);
