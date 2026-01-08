const nodemailer = require("nodemailer");

console.log("EMAIL CONFIG:", {
  user: process.env.ADMIN_EMAIL,
  passExists: !!process.env.ADMIN_EMAIL_PASS
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASS
  }
});

module.exports.sendOTP = async (to, otp) => {
  // console.log("SENDING OTP TO:", to);

  await transporter.sendMail({
    from: `"WiFi Admin" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject: "Admin Password Reset OTP",
    text: `Your OTP is ${otp}. Valid for 10 minutes.`
  });
};
