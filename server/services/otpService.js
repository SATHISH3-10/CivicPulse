import crypto from 'crypto';

// In-memory OTP store for active verification codes
// Key: contact string (email or phone)
// Value: { otp, expiresAt, purpose, attempts }
const otpStore = new Map();

/**
 * Generate and store a secure 6-digit OTP
 */
export async function generateOTP(contact, purpose = 'general') {
  if (!contact || typeof contact !== 'string') {
    throw new Error('Valid email or phone number is required');
  }

  const cleanContact = contact.trim().toLowerCase();
  
  // Generate cryptographically random 6-digit code
  const otpNum = crypto.randomInt(100000, 999999);
  const otp = otpNum.toString();

  // Expiration: 10 minutes from now
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(cleanContact, {
    otp,
    expiresAt,
    purpose,
    attempts: 0
  });

  // Always log OTP to server console for development and inspection
  console.log(`\n==================================================`);
  console.log(`[CIVICPULSE OTP SERVICE]`);
  console.log(`Purpose  : ${purpose.toUpperCase()}`);
  console.log(`Contact  : ${cleanContact}`);
  console.log(`OTP Code : ${otp}`);
  console.log(`Expires  : ${new Date(expiresAt).toLocaleTimeString()}`);
  console.log(`==================================================\n`);

  // Optional Nodemailer dispatch if SMTP credentials exist
  if (cleanContact.includes('@') && process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CivicPulse AI Security" <noreply@civicpulse.org>',
        to: cleanContact,
        subject: `Your CivicPulse AI Verification Code: ${otp}`,
        text: `Your CivicPulse verification code for ${purpose} is ${otp}. This code is valid for 10 minutes. Do not share it with anyone.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0d9488; margin-top: 0;">CivicPulse AI Security Verification</h2>
            <p>Your verification code for <strong>${purpose}</strong> is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f172a; padding: 12px 20px; background: #f1f5f9; border-radius: 6px; text-align: center; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      });
      console.log(`[OTP SERVICE] Sent email to ${cleanContact} via Nodemailer`);
    } catch (err) {
      console.warn(`[OTP SERVICE] Could not send email via Nodemailer: ${err.message}`);
    }
  }

  // Optional Twilio SMS dispatch if Twilio credentials exist
  if (!cleanContact.includes('@') && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = (await import('twilio')).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your CivicPulse AI verification code is ${otp}. Valid for 10 mins.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: cleanContact
      });
      console.log(`[OTP SERVICE] Sent SMS to ${cleanContact} via Twilio`);
    } catch (err) {
      console.warn(`[OTP SERVICE] Could not send SMS via Twilio: ${err.message}`);
    }
  }

  const emailSent = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && cleanContact.includes('@'));

  return {
    success: true,
    otp,
    emailSent,
    message: emailSent
      ? `Verification code sent to ${cleanContact}`
      : `Verification code generated: ${otp} (Enter this code to proceed)`
  };
}

/**
 * Verify an OTP code provided by the user
 */
export function verifyOTP(contact, inputOtp, purpose = 'general') {
  if (!contact || !inputOtp) {
    return { valid: false, error: 'Contact address and verification code are required' };
  }

  const cleanContact = contact.trim().toLowerCase();
  const record = otpStore.get(cleanContact);

  if (!record) {
    return { valid: false, error: 'No verification code requested or code has expired. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanContact);
    return { valid: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanContact);
    return { valid: false, error: 'Too many invalid attempts. Please request a new code.' };
  }

  if (record.otp !== String(inputOtp).trim()) {
    record.attempts += 1;
    return { valid: false, error: 'Invalid verification code. Please check your code and try again.' };
  }

  // Verification succeeded - clear OTP for single-use security
  otpStore.delete(cleanContact);
  return { valid: true };
}
