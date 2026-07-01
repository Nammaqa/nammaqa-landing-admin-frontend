import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type ContactMessageRecord = {
  id: number;
  contact_number: string | null;
  otp: string | null;
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
    const otp = normalizeString(body?.otp);
    const item = await findContactMessage(body?.id, body?.contact_number);

    if (!item) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      );
    }

    if (!otp) {
      return NextResponse.json(
        { error: "OTP is required" },
        { status: 400 }
      );
    }

    if (!item.otp || item.otp !== otp) {
      await item.update({ otpverified: false });

      return NextResponse.json(
        { error: "Invalid OTP", verified: false },
        { status: 400 }
      );
    }

    await item.update({ otp: null, otpverified: true });

    return NextResponse.json({
      message: "OTP verified",
      verified: true,
      item: {
        id: item.id,
        contact_number: item.contact_number,
        otpverified: true,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
