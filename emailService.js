const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendInvoiceEmail = async ({ to, subject, text, pdfStream, filename }) => {
  const emailOptions = {
    from: `"Odontologia Lavalle" <${process.env.EMAIL_USER}>`,
    to: "matias.velozo.4c@gmail.com",
    subject: subject || "Tu Comprobante de Reserva - Odontologia Lavalle",
    text: text || "Gracias por tu reserva en Odontologia Lavalle.",
  };

  const info = await transporter.sendMail(emailOptions);

  console.log("Mensaje enviado: %s", info.messageId);
};

module.exports = { sendInvoiceEmail };
