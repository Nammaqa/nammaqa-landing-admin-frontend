import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sendContactOtp } from "@/lib/contactOtp";

type ContactMessageRecord = {
  id: number;
  contact_number: string | null;
  otp: string | null;
  otpverified: boolean;
  updatedAt?: string | Date;
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

function getContactLookupFromUrl(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  return {
    id: searchParams.get("id"),
    contact_number: searchParams.get("contact_number"),
  };
}

async function resendOtp(id: unknown, contactNumber: unknown) {
  try {
    const item = await findContactMessage(id, contactNumber);

    if (!item) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      );
    }

    if (!item.contact_number) {
      return NextResponse.json(
        { error: "Contact number is required to resend OTP" },
        { status: 400 }
      );
    }
    console.log("Resend OTP request for contact message ID:", item.id, "contact number:", item.contact_number);
    const { otp, providerStatus, providerHttpStatus, providerResponseText } = await sendContactOtp(item.contact_number);
    console.log("Resend OTP provider result:", {
      itemId: item.id,
      contact_number: item.contact_number,
      providerStatus,
      providerHttpStatus,
      providerResponseText,
      otp,
    });
    await item.update({ otp, otpverified: false });

    return NextResponse.json({
      message: providerStatus === "sent" ? "OTP resent" : "OTP generated but provider did not confirm delivery",
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
      { error: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { id, contact_number } = getContactLookupFromUrl(req);
  return resendOtp(id, contact_number);
}
