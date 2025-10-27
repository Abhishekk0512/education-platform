// import nodemailer from 'nodemailer';

// const sendEmail = async (to, subject, text) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     }
//   });

//   await transporter.sendMail({
//     from: `"Edu Platform" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text
//   });
// };

// export default sendEmail;
import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email service not configured properly.');
    }

    console.log('Attempting to send email to:', to);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log('✅ Email transporter verified successfully');

    const mailOptions = {
      from: `"Edu Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #4F46E5;">Welcome to Edu Platform!</h2>
          <p>${text.replace(/\n/g, '<br>')}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📩 Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
};

export default sendEmail;
