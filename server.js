require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

/* -------------------- ROUTES IMPORT -------------------- */
const authRoutes = require("./routes/auth.routes");
const sessionRoutes = require("./routes/session.routes");
const routerRoutes = require("./routes/router.routes");
const adminAttendanceRoutes = require("./routes/admin.attendance.routes");

const app = express();

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow captive portal, router, curl, wget
      if (
        !origin ||
        origin.startsWith("http://192.168.") ||
        origin === process.env.FRONTEND_URL ||
        origin === "http://localhost:5174"
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true
  })
);

/* -------------------- BODY PARSERS (CRITICAL) -------------------- */
app.use(express.json());                      // JSON (React, router)
app.use(express.urlencoded({ extended: true })); // splash.html forms

/* -------------------- HEALTH -------------------- */
app.get("/__health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString()
  });
});

/* -------------------- API ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/router", routerRoutes);

app.use("/api/admin/auth", require("./routes/admin.auth.routes"));
app.use("/api/admin/students", require("./routes/admin.students.routes"));

app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/admin/attendance", adminAttendanceRoutes);

app.use("/api/test", require("./routes/test.routes"));

app.use("/api/v2/captive", require("./routes/v2.captive.routes"));
app.use("/api/v2/router", require("./routes/v2.router.routes"));
app.use("/api/admin", require("./routes/admin.router"));

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);

  if (res.headersSent) return next(err);

  res.status(500).json({ message: "Internal Server Error" });
});

/* -------------------- DB + SERVER -------------------- */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
