import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function GET() {
  try {
    const items = await (db as any).NewsletterSubscription.findAll({
      order: [["createdAt", "DESC"]],
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);

    if (!email || !emailPattern.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    const existing = await (db as any).NewsletterSubscription.findOne({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Email is already subscribed",
          duplicate: true,
          item: existing,
        },
        { status: 200 }
      );
    }

    const newItem = await (db as any).NewsletterSubscription.create({ email });

    return NextResponse.json(
      {
        message: "Newsletter subscription created",
        duplicate: false,
        item: newItem,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create newsletter subscription" },
      { status: 500 }
    );
  }
}
