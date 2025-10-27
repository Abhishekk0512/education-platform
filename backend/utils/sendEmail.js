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
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      throw new Error('Email service not configured. Please contact administrator.');
    }

    console.log('Attempting to send email to:', to);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true, // Enable debug output
      logger: true // Log information in console
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');

    const mailOptions = {
      from: `"Edu Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to Edu Platform!</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${text.split('\n').map(line => `<p style="margin: 10px 0;">${line}</p>`).join('')}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't create an account, please ignore this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

export default sendEmail;