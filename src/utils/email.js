import nodemailer from "nodemailer";

export async function sendVerificationEmail(email, code) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Musical Odyssey - Your OTP Verification Code",
      text: `Your OTP verification code is: ${code}`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 20px auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="https://musicalodyssey.com" style="text-decoration: none;">
              <img src="https://yourwebsite.com/icons/musical-odyssey-sm.png" alt="Musical Odyssey Logo" style="max-width: 150px; margin-bottom: 10px;" />
              <h2 style="color: orange; font-size: 36px; font-weight: bold; margin: 10px 0; text-decoration: underline;">Musical Odyssey</h2>
            </a>
            <h3 style="color: #333; margin-top: 20px;">Your OTP Verification Code</h3>
          </div>
          <p>Hi <span style="color: blue; text-decoration: underline;">${email}</span>,</p>
          <p>Use the following code to verify your account:</p>
          <p style="font-size: 28px; font-weight: bold; color: orange; text-align: center; margin: 30px 0;">${code}</p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification code ${code} sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Failed to send verification email.");
  }
}
