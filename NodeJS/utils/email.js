import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendResetEmail = async (to, link) => {
  try {
    const info = await transporter.sendMail({
      from: `"InternPath Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Password Reset Request",
      html: `<a href="${link}">Reset Password</a>`
    });

    console.log("✅ EMAIL SENT");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

  } catch (err) {
    console.log("❌ EMAIL FAILED");
    console.log(err);
  }
};
transporter.verify((error, success) => {
  if (error) console.log("SMTP ERROR:", error);
  else console.log("SMTP ready ✅");
});