const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Try to create a transporter with Gmail, but use ethereal email as fallback if credentials aren't provided
  let transporter;
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // For development, if no email pass provided, just log the email contents
    console.log("No EMAIL_USER and EMAIL_PASS provided in environment. Printing email to console:");
    console.log(`To: ${options.email}\nSubject: ${options.subject}\nMessage: ${options.message}`);
    return;
  }

  const mailOptions = {
    from: `HireFloww <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html, // Accepting HTML instead of text
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
