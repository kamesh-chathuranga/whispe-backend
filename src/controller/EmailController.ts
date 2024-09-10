import { Request, Response } from "express";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export type EmailData = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const sendResetPasswordEmail = async (data: EmailData) => {
  const info = await transporter.sendMail({
    from: '"Click Cart" <clickCart@gmail.com>',
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });

  console.log("Message sent: %s", info.messageId);
};

export default sendResetPasswordEmail;
