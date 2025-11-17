import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset - CivicServe',
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p>
        <a href="${resetLink}" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendStatusUpdateEmail = async (email: string, requestTitle: string, status: string, message: string): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `Service Request Update - ${requestTitle}`,
    html: `
      <h2>Your Service Request Has Been Updated</h2>
      <p><strong>Request:</strong> ${requestTitle}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p>Log in to your account to view more details.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
