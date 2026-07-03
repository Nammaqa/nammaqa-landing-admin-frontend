import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const MAIL_SERVICE_URL =
  process.env.MAIL_SERVICE_URL || "https://nammaqa-mail-service.vercel.app/api/send-email";

type Subscriber = {
  email?: string;
};

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function sendEmail(email: string, subject: string, html: string) {
  const response = await fetch(MAIL_SERVICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: email,
      email,
      subject,
      html,
      content: html,
      message: html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Mail service returned ${response.status}`);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const campaign = await (db as any).Campaign.findByPk(id);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const subscribers = await (db as any).NewsletterSubscription.findAll({
      attributes: ["email"],
      order: [["createdAt", "DESC"]],
    });
    const subscriberEmails = subscribers
      .map((subscriber: Subscriber) => subscriber.email)
      .map(normalizeEmail)
      .filter((email: string) => email.length > 0);
    const requestedEmails = Array.isArray(body?.emails)
      ? body.emails.map(normalizeEmail).filter((email: string) => email.length > 0)
      : [];
    const subscriberEmailSet = new Set(subscriberEmails);
    const emails = requestedEmails.length > 0
      ? [...new Set(requestedEmails)].filter((email) => subscriberEmailSet.has(email))
      : subscriberEmails;

    if (emails.length === 0) {
      return NextResponse.json({ error: "No selected newsletter subscribers found" }, { status: 400 });
    }

    const subject = String(campaign.subject || "").trim();
    const html = String(campaign.content || "").trim();

    if (!subject || !html) {
      return NextResponse.json({ error: "Campaign subject and content are required" }, { status: 400 });
    }

    const results = await Promise.allSettled(
      emails.map((email: string) => sendEmail(email, subject, html))
    );
    const failedEmails = results
      .map((result, index) => (result.status === "rejected" ? emails[index] : null))
      .filter((email): email is string => Boolean(email));

    return NextResponse.json({
      total: emails.length,
      sent: emails.length - failedEmails.length,
      failed: failedEmails.length,
      failedEmails,
    });
  } catch (error: any) {
    console.error("Campaign send error:", error.message, error.errors);
    return NextResponse.json(
      { error: error.message || "Failed to send campaign" },
      { status: 500 }
    );
  }
}
