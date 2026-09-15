import ContactInquiry from '../models/ContactInquiry.js';
import User from '../models/User.js';

/**
 * Dispatch an email notification to Admin or Citizen via Nodemailer or Console Log
 */
async function sendNotificationEmail({ to, subject, htmlText, plainText }) {
  const cleanTo = to.trim().toLowerCase();
  
  // Console logging for clear visibility
  console.log(`\n==================================================`);
  console.log(`[CIVICPULSE EMAIL DISPATCH]`);
  console.log(`To      : ${cleanTo}`);
  console.log(`Subject : ${subject}`);
  console.log(`Content : ${plainText}`);
  console.log(`==================================================\n`);

  // Optional Nodemailer dispatch if SMTP credentials exist
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
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
        from: process.env.SMTP_FROM || '"CivicPulse Support Desk" <support@civicpulse.org>',
        to: cleanTo,
        subject: subject,
        text: plainText,
        html: htmlText
      });
      console.log(`[EMAIL DISPATCH] Successfully sent email to ${cleanTo} via Nodemailer`);
    } catch (err) {
      console.warn(`[EMAIL DISPATCH] Could not send email via Nodemailer: ${err.message}`);
    }
  }
}

/**
 * Submit Contact Inquiry / Feedback (Public)
 */
export async function submitContactInquiry(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required fields' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const inquirySubject = subject && subject.trim() ? subject.trim() : 'General Support / Feedback Inquiry';

    // 1. Save to Database
    const inquiry = await ContactInquiry.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      subject: inquirySubject,
      message: message.trim(),
      status: 'pending',
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Determine Admin Email target
    // Priority: env ADMIN_EMAIL > Admin user email in DB > default 'support@civicpulse.org'
    let adminTargetEmail = process.env.ADMIN_EMAIL;
    if (!adminTargetEmail) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser && adminUser.email) {
        adminTargetEmail = adminUser.email;
      } else {
        adminTargetEmail = 'support@civicpulse.org';
      }
    }

    // 3. Send Notification Email to Admin
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
          <div style="width: 36px; height: 36px; background: #0d9488; color: white; border-radius: 8px; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 16px;">CP</div>
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">New CivicPulse Citizen Inquiry</h2>
        </div>
        
        <p style="color: #475569; font-size: 15px;">You have received a new contact submission/feedback via CivicPulse AI:</p>
        
        <div style="background: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; margin: 16px 0; border-radius: 6px;">
          <p style="margin: 4px 0; color: #1e293b;"><strong>Sender Name:</strong> ${name.trim()}</p>
          <p style="margin: 4px 0; color: #1e293b;"><strong>Email:</strong> <a href="mailto:${cleanEmail}" style="color: #0d9488;">${cleanEmail}</a></p>
          <p style="margin: 4px 0; color: #1e293b;"><strong>Phone:</strong> ${phone ? phone.trim() : 'Not provided'}</p>
          <p style="margin: 4px 0; color: #1e293b;"><strong>Subject:</strong> ${inquirySubject}</p>
          <p style="margin: 12px 0 4px 0; color: #1e293b;"><strong>Message:</strong></p>
          <p style="margin: 0; color: #334155; white-space: pre-wrap; font-style: italic;">"${message.trim()}"</p>
        </div>

        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
          Logged in CivicPulse Admin Portal. Log in to the Command Center to review or respond directly.
        </p>
      </div>
    `;

    const plainText = `NEW INQUIRY FROM: ${name.trim()} (${cleanEmail})
Phone: ${phone || 'N/A'}
Subject: ${inquirySubject}
Message: ${message.trim()}`;

    // Send email asynchronously (does not block response)
    sendNotificationEmail({
      to: adminTargetEmail,
      subject: `[CivicPulse Feedback] ${inquirySubject} - From ${name.trim()}`,
      htmlText: emailHtml,
      plainText: plainText
    }).catch(err => console.error('Admin Email send error:', err));

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting CivicPulse AI! Your message has been sent to municipal support and the admin team.',
      inquiry
    });
  } catch (error) {
    console.error('Submit contact inquiry error:', error);
    return res.status(500).json({ error: 'Failed to submit contact inquiry' });
  }
}

/**
 * Get All Contact Inquiries / Feedback (Admin Only)
 */
export async function getAdminFeedback(req, res) {
  try {
    const inquiries = await ContactInquiry.find();
    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = inquiries.length;
    const pending = inquiries.filter(i => i.status === 'pending' || !i.status).length;
    const reviewed = inquiries.filter(i => i.status === 'reviewed').length;
    const resolved = inquiries.filter(i => i.status === 'resolved').length;

    let adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      const adminUser = await User.findOne({ role: 'admin' });
      adminEmail = adminUser?.email || 'support@civicpulse.org';
    }

    return res.json({
      inquiries,
      stats: { total, pending, reviewed, resolved },
      adminEmail
    });
  } catch (error) {
    console.error('Get admin feedback error:', error);
    return res.status(500).json({ error: 'Failed to load feedback inquiries' });
  }
}

/**
 * Update Inquiry Status (Admin Only)
 */
export async function updateInquiryStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(id, {
      status,
      updatedAt: new Date()
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    return res.json({ success: true, inquiry });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    return res.status(500).json({ error: 'Failed to update inquiry status' });
  }
}

/**
 * Reply to Inquiry via Email (Admin Only)
 */
export async function replyToInquiry(req, res) {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ error: 'Reply message is required' });
    }

    const inquiry = await ContactInquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    const newReply = {
      message: replyMessage.trim(),
      repliedBy: req.user?.name || 'Municipal Admin',
      createdAt: new Date()
    };

    const updatedReplies = [...(inquiry.replies || []), newReply];

    inquiry.replies = updatedReplies;
    inquiry.status = 'resolved';
    inquiry.updatedAt = new Date();
    await inquiry.save();

    // Email Citizen back
    const citizenEmailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #0d9488; margin-top: 0;">Response from CivicPulse Municipal Support</h2>
        <p>Dear <strong>${inquiry.name}</strong>,</p>
        <p style="color: #475569;">Thank you for reaching out to CivicPulse AI. An administrator has responded to your inquiry regarding <strong>"${inquiry.subject}"</strong>:</p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 16px 0; border-radius: 6px;">
          <p style="margin: 0; color: #166534; font-size: 15px; white-space: pre-wrap;">${replyMessage.trim()}</p>
        </div>

        <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          <strong>Original Message:</strong> "${inquiry.message}"
        </div>
      </div>
    `;

    const plainText = `Response from CivicPulse Support regarding "${inquiry.subject}":
${replyMessage.trim()}

Original Message:
${inquiry.message}`;

    sendNotificationEmail({
      to: inquiry.email,
      subject: `[CivicPulse Support Response] Re: ${inquiry.subject}`,
      htmlText: citizenEmailHtml,
      plainText: plainText
    }).catch(err => console.error('Citizen reply email send error:', err));

    return res.json({ success: true, inquiry, reply: newReply });
  } catch (error) {
    console.error('Reply to inquiry error:', error);
    return res.status(500).json({ error: 'Failed to send reply' });
  }
}
