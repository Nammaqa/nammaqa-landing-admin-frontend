import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type ContactMessageRecord = {
  id: number;
  full_name: string;
  email: string;
  contact_number: string | null;
  otp: string | null;
  otpverified: boolean;
  message: string;
  update(values: Record<string, unknown>): Promise<ContactMessageRecord>;
  destroy(): Promise<void>;
};

type ContactMessageModel = {
  findAll(options?: unknown): Promise<ContactMessageRecord[]>;
  create(values: Record<string, unknown>): Promise<ContactMessageRecord>;
};

const ContactMessage = (db as unknown as { ContactMessage: ContactMessageModel }).ContactMessage;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactNumberPattern = /^[+()\-\s\d]{7,20}$/;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

function normalizeContactNumber(value: unknown) {
  return normalizeString(value);
}

function isValidContactNumber(value: string) {
  const digitCount = value.replace(/\D/g, "").length;
  return contactNumberPattern.test(value) && digitCount >= 7 && digitCount <= 15;
}

export async function GET() {
  try {
    const items = await ContactMessage.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const full_name = normalizeString(body?.full_name);
    const email = normalizeEmail(body?.email);
    const contact_number = normalizeContactNumber(body?.contact_number);
    const message = normalizeString(body?.message);

    if (!full_name || !email || !contact_number || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    if (!isValidContactNumber(contact_number)) {
      return NextResponse.json(
        { error: "A valid contact number is required" },
        { status: 400 }
      );
    }

    const newItem = await ContactMessage.create({
      full_name,
      email,
      contact_number,
      otp: null,
      otpverified: false,
      message,
    });

    return NextResponse.json(
      {
        message: "Contact message created",
        item: newItem,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create contact message" },
      { status: 500 }
    );
  }
}
