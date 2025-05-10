export default function EmailPreview() {
  const email = "test@example.com";
  const code = "123456";

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 20px auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://musicalodyssey.com" style="text-decoration: none;">
          <img src="/icons/musical-odyssey-sm.png" alt="Musical Odyssey Logo" style="max-width: 150px; margin-bottom: 10px;" />
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
  `;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: emailHtml }}
      style={{ margin: "20px", padding: "20px", backgroundColor: "#f9f9f9" }}
    />
  );
}