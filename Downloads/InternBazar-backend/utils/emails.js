const nodemailer = require("nodemailer");
const { google } = require("googleapis");
require("dotenv").config();

const createTransporter = async () => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const accessToken = await new Promise((resolve, reject) => {
    oAuth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token :(");
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  console.log(transporter);
  return transporter;
};

const sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};

exports.sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    from: process.env.EMAIL,
    subject: "Verification OTP for InternBazaar",
    text: `Please use this one time password ${otp} to verify your account.`,
  });
};

exports.sendPasswordResetEmail = async (email, link) => {
  await sendEmail({
    to: email,
    from: process.env.EMAIL,
    subject: "Password reset link for InternBazaar",
    text: `<p>click on this <a href="${link}">link</a> to reset your password<p>`,
  });
};
