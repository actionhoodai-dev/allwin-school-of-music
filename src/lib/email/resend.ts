// ============================================
// Email Service (Resend) & OTP Generator
// ============================================

import crypto from 'crypto';

/**
 * Generates a random 6-digit numerical OTP
 */
export function generateNumericOtp(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}

/**
 * Cryptographically hashes an OTP using SHA-256 for secure storage
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Sends an OTP email via Resend API
 */
export async function sendOtpEmail(params: {
  toEmail: string;
  studentName: string;
  studentId: string;
  otp: string;
  expiryMinutes?: number;
}): Promise<{ success: boolean; error?: string; isTestModeRestriction?: boolean; accountOwnerEmail?: string }> {
  const { toEmail, studentName, studentId, otp, expiryMinutes = 10 } = params;
  const apiKey = process.env.RESEND_API_KEY;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP - Allwin School of Music</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fc; margin: 0; padding: 24px; color: #0f172a; }
        .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0a1628 0%, #2d1066 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 0; font-size: 13px; color: #cbd5e1; }
        .content { padding: 32px 24px; text-align: center; }
        .otp-box { margin: 24px auto; padding: 18px 24px; background: #f1f5f9; border: 2px dashed #7c3aed; border-radius: 14px; display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4a1d96; font-family: monospace; }
        .badge { display: inline-block; background: #f3e8ff; color: #6d28d9; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
        .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>ALLWIN SCHOOL OF MUSIC</h1>
          <p>Student & Parent Portal Security</p>
        </div>
        <div class="content">
          <span class="badge">Student ID: ${studentId}</span>
          <h2 style="margin: 0 0 8px; font-size: 18px; color: #1e293b;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 16px;">
            Hello <strong>${studentName}</strong> (or Parent/Guardian),<br/>
            Use the following 6-digit verification code to reset your Student Portal password:
          </p>
          
          <div class="otp-box">${otp}</div>
          
          <p style="font-size: 13px; color: #dc2626; margin: 16px 0 0; font-weight: 500;">
            ⏳ This code expires in <strong>${expiryMinutes} minutes</strong>.
          </p>
          <p style="font-size: 12px; color: #94a3b8; margin: 8px 0 0;">
            If you did not request this verification, you can safely ignore this email.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 4px;"><strong>Allwin School of Music & Musicals</strong></p>
          <p style="margin: 0;">Salem, Tamil Nadu, India • Phone: +91 94892 03683</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY is not configured in environment variables.');
    console.log(`[Resend OTP Simulation] To: ${toEmail} | Student: ${studentId} | OTP: ${otp}`);
    return { success: true };
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'Allwin School of Music <onboarding@resend.dev>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toEmail],
        subject: `Your Student Portal OTP: ${otp} (Allwin School of Music)`,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Resend Error Response]', errorData);

      const isTestRestriction = errorData.name === 'validation_error' && errorData.message?.includes('only send testing emails to your own email address');
      const accountOwnerMatch = errorData.message?.match(/\(([^)]+)\)/);
      const accountOwnerEmail = accountOwnerMatch ? accountOwnerMatch[1] : undefined;

      return {
        success: false,
        error: errorData.message || 'Failed to dispatch email',
        isTestModeRestriction: isTestRestriction,
        accountOwnerEmail,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Resend Request Exception]', err);
    return { success: false, error: err.message || 'Network error' };
  }
}
