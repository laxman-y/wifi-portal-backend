require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

async function deleteAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await Admin.deleteOne({ username: "admin" });
  console.log("Deleted:", result.deletedCount);

  process.exit();
}

deleteAdmin();
