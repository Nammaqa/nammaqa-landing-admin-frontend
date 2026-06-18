import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const email = normalizeEmail(body?.email);

    if (!email || !emailPattern.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    const item = await (db as any).NewsletterSubscription.findByPk(id);

    if (!item) {
      return NextResponse.json(
        { error: "Newsletter subscription not found" },
        { status: 404 }
      );
    }

    const duplicate = await (db as any).NewsletterSubscription.findOne({
      where: { email },
    });

    if (duplicate && String(duplicate.id) !== String(id)) {
      return NextResponse.json(
        { error: "Email is already subscribed" },
        { status: 409 }
      );
    }

    await item.update({ email });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update newsletter subscription" },
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
    const item = await (db as any).NewsletterSubscription.findByPk(id);

    if (!item) {
      return NextResponse.json(
        { error: "Newsletter subscription not found" },
        { status: 404 }
      );
    }

    await item.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete newsletter subscription" },
      { status: 500 }
    );
  }
}
