import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sendContactOtp } from "@/lib/contactOtp";

type ContactMessageRecord = {
  id: number;
  contact_number: string | null;
  otpverified: boolean;
  update(values: Record<string, unknown>): Promise<ContactMessageRecord>;
};

type ContactMessageModel = {
  findByPk(id: string): Promise<ContactMessageRecord | null>;
  findOne(options: unknown): Promise<ContactMessageRecord | null>;
};

const ContactMessage = (db as unknown as { ContactMessage: ContactMessageModel }).ContactMessage;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function findContactMessage(id: unknown, contactNumber: unknown) {
  const normalizedId = normalizeString(id);
  const normalizedContactNumber = normalizeString(contactNumber);

  if (normalizedId) {
    return ContactMessage.findByPk(normalizedId);
  }

  if (normalizedContactNumber) {
    return ContactMessage.findOne({
      where: { contact_number: normalizedContactNumber },
      order: [["createdAt", "DESC"]],
    });
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await findContactMessage(body?.id, body?.contact_number);

    if (!item) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      );
    }

    if (!item.contact_number) {
      return NextResponse.json(
        { error: "Contact number is required to send OTP" },
        { status: 400 }
      );
    }

    const { otp, providerStatus, providerHttpStatus, providerResponseText } = await sendContactOtp(item.contact_number);
    await item.update({ otp, otpverified: false });

    return NextResponse.json({
      message: providerStatus === "sent" ? "OTP generated and sent" : "OTP generated but provider did not confirm delivery",
      providerStatus,
      providerHttpStatus,
      item: {
        id: item.id,
        contact_number: item.contact_number,
        otpverified: false,
      },
      ...(process.env.NODE_ENV !== "production" ? { otp, providerResponse: providerResponseText } : {}),
    }, { status: providerStatus === "sent" ? 200 : 502 });
  } catch {
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
