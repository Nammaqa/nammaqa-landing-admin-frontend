import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return normalizeString(value).toLowerCase();
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const item = await (db as any).ContactMessage.findByPk(id);

    if (!item) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      );
    }

    await item.update({ full_name, email, message });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update contact message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await (db as any).ContactMessage.findByPk(id);

    if (!item) {
      return NextResponse.json(
        { error: "Contact message not found" },
        { status: 404 }
      );
    }

    await item.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete contact message" },
      { status: 500 }
    );
  }
}
