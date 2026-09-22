import { Resend } from 'resend';

let _resend = null;

const getResend = () => {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) {
    // In tests / local dev without a key, skip real sending.
    return null;
  }
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
};

const FROM = process.env.EMAIL_FROM || 'TeamFlow <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (to, rawToken) => {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping verification email to', to);
    return;
  }

  const link = `${CLIENT_URL}/verify-email?token=${rawToken}`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Verify your TeamFlow email',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
          <h2 style="margin: 0 0 8px;">Verify your email</h2>
          <p style="color: #475569;">Click the button below to confirm your email and activate your TeamFlow account.</p>
          <a href="${link}"
             style="display: inline-block; margin: 16px 0; padding: 12px 20px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Verify email
          </a>
          <p style="color: #94a3b8; font-size: 13px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
          <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">${link}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('sendVerificationEmail failed:', err.message);
  }
};

export const sendPasswordResetEmail = async (to, rawToken) => {
  const link = `${CLIENT_URL}/reset-password?token=${rawToken}`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Reset your TeamFlow password',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
          <h2 style="margin: 0 0 8px;">Reset your password</h2>
          <p style="color: #475569;">We received a request to reset your TeamFlow password. Click the button below to choose a new one.</p>
          <a href="${link}"
             style="display: inline-block; margin: 16px 0; padding: 12px 20px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Reset password
          </a>
          <p style="color: #94a3b8; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>
          <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">${link}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('sendPasswordResetEmail failed:', err.message);
  }
};