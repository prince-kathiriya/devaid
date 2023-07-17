const nodemailer = require('nodemailer');
const templates = require('./mail.templates');
const { logger } = require('../../helpers');
const env = require('../../config/env.config');

//! create transporter for mail server
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

//! verify connection configuration for mail server
transporter.verify((error, success) => {
  if (error) {
    logger.error('✘ UNABLE TO CONNECT TO THE MAIL SERVER');
    logger.error(error);
  } else {
    logger.info(`✔ MAIL SERVER IS READY TO SEND MAILS`);
  }
});

module.exports = {
  sendOTP: async ({ email, name, otp }) => {
    let mailOptions = {
      from: env.EMAIL_USER,
      to: `${email}`,

      subject: `${env.PROJECT_NAME} | OTP`,
      text: 'One Time Password To Verify Your Account',
      html: templates.sendOTP({ otp, name }),
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  },
};
