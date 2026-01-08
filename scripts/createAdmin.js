require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // ❌ avoid duplicate admin
    const exists = await Admin.findOne({ username: "admin" });
    if (exists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashed = await bcrypt.hash("admin123", 10);

    await Admin.create({
      username: "admin",
      email: "laxmanyadav89357@gmail.com",   // ✅ ADD EMAIL
      password: hashed
    });

    console.log("Admin created successfully:");
    console.log("username: admin");
    console.log("email: admin@example.com");
    console.log("password: admin123");

    process.exit();
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
}

createAdmin();
