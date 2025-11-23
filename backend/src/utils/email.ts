import nodemailer from 'nodemailer';

let _transporter: nodemailer.Transporter | null = null;
let _usingEthereal = false;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  if (host) {
    // Use configured SMTP
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    _usingEthereal = false;
    return _transporter;
  }

  // Fallback to Ethereal test account for development / CI
  const testAccount = await nodemailer.createTestAccount();
  _transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  _usingEthereal = true;
  console.warn('[EMAIL] No SMTP configured — using Ethereal test account. Preview URLs will be logged.');
  return _transporter;
}

async function trySend(mailOptions: nodemailer.SendMailOptions): Promise<void> {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    if (_usingEthereal) {
      const preview = nodemailer.getTestMessageUrl(info);
      console.log('[EMAIL] Preview URL:', preview);
    }
  } catch (error) {
    console.warn('[EMAIL] Failed to send email:', error instanceof Error ? error.message : error);
  }
}

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<void> => {
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.SMTP_USER || 'no-reply@example.com',
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

  await trySend(mailOptions);
};

export const sendStatusUpdateEmail = async (email: string, requestTitle: string, status: string, message: string): Promise<void> => {
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.SMTP_USER || 'no-reply@example.com',
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

  await trySend(mailOptions);
};
