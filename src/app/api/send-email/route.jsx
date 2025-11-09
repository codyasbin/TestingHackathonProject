import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Configure your email transport
    const transporter = nodemailer.createTransport({
      service: "gmail", // Change to your SMTP provider (Gmail, Outlook, etc.)
      auth: {
        user: "himalthapa346@gmail.com", // Your email
        pass: process.env.EMAIL_APP_PASS, // Generate an App Password for security
      },
    });

    // Format subject based on selection
    const subjectMap = {
      general: "General Inquiry",
      support: "Technical Support",
      provider: "Become a Service Provider",
      partnership: "Partnership Opportunity",
      feedback: "Feedback",
      other: "Other",
    };

    const formattedSubject = subjectMap[subject] || subject;

    // Email content with HTML formatting
    const mailOptions = {
      from: `"Sahayog Contact Form" <himalthapa346@gmail.com>`, // Sender
      replyTo: email, // User's email for easy reply
      to: email, // Your receiving email
      subject: `[Sahayog Contact] ${formattedSubject} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background: linear-gradient(to right, #059669, #10b981);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .field {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
            }
            .field:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #059669;
              display: block;
              margin-bottom: 5px;
            }
            .value {
              color: #4b5563;
            }
            .message-box {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              border-left: 4px solid #059669;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🔧 New Contact Form Submission</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Sahayog - Fix, Don't Replace</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Name:</span>
                <span class="value">${name}</span>
              </div>
              
              <div class="field">
                <span class="label">📧 Email:</span>
                <span class="value"><a href="mailto:${email}" style="color: #059669;">${email}</a></span>
              </div>
              
              ${
                phone
                  ? `
              <div class="field">
                <span class="label">📱 Phone:</span>
                <span class="value"><a href="tel:${phone}" style="color: #059669;">${phone}</a></span>
              </div>
              `
                  : ""
              }
              
              <div class="field">
                <span class="label">📋 Subject:</span>
                <span class="value">${formattedSubject}</span>
              </div>
              
              <div class="field">
                <span class="label">💬 Message:</span>
                <div class="message-box">
                  ${message.replace(/\n/g, "<br>")}
                </div>
              </div>
              
              <div class="footer">
                <p>This email was sent from the Sahayog contact form.</p>
                <p>Reply directly to this email to respond to ${name}.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      // Plain text version as fallback
      text: `
New Contact Form Submission - Sahayog

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ""}
Subject: ${formattedSubject}

Message:
${message}

---
Reply to: ${email}
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email. Please try again later.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
