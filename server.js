require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const sessionRoutes = require("./routes/session.routes");
const routerRoutes = require("./routes/router.routes");


const app = express();

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow captive portal & non-browser clients
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


app.use(express.json());

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/router", routerRoutes);
app.use("/api/router", require("./routes/router.routes"));
app.use("/api/admin/auth", require("./routes/admin.auth.routes"));
app.use("/api/admin/students", require("./routes/admin.students.routes"));

/* -------------------- ERROR HANDLER -------------------- */
// Prevents ERR_HTTP_HEADERS_SENT crashes
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

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
