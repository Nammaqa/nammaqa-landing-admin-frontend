import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

export async function GET() {
  try {
    const items = await (db as any).ContactMessage.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(items);
  } catch (error) {
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
    const message = normalizeString(body?.message);
    if (!full_name || !email || !message) {
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

    const newItem = await (db as any).ContactMessage.create({
      full_name,
      email,
      message,
    });

    return NextResponse.json(
      {
        message: "Contact message created",
        item: newItem,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create contact message" },
      { status: 500 }
    );
  }
}
