const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ active: false });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id);

    if (!student || student.activeToken !== token) {
      return res.status(401).json({ active: false });
    }

    req.student = student;
    return next();
  } catch (err) {
    return res.status(401).json({ active: false });
  }
};
