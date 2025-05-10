import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Ensure your .env.local contains:
// GMAIL_USER=muhammednetr@gmail.com
// GMAIL_PASS=gswd ammv nrmr euvg

export async function POST(request: Request) {
  const { to, subject, message, attachments } = await request.json();

  try {
    // Create transporter using SMTP credentials directly
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Support Message</h2>
        <p style="font-size: 16px; line-height: 1.5;">${message.replace(
          /\n/g,
          "<br>"
        )}</p>
    `;

    if (attachments && attachments.length > 0) {
      html += `
        <div style="margin-top: 20px;">
          <h3 style="font-size: 14px; color: #4b5563;">Attachments:</h3>
          <ul style="padding-left: 20px;">
      `;
      attachments.forEach((url: string, index: number) => {
        html += `
          <li style="margin-bottom: 5px;">
            <a href="${url}" style="color: #2563eb; text-decoration: none;">
              Attachment ${index + 1}
            </a>
          </li>
        `;
      });
      html += `
          </ul>
        </div>
      `;
    }

    html += `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">This is an automated message from SMS Globe Support.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `SMS Globe Support <support@smsglobe.net>`,
      to,
      subject: `Support: ${subject}`,
      text: message,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
