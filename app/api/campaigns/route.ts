import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const items = await (db as any).Campaign.findAll({ order: [["createdAt", "DESC"]] });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Campaign GET error:", error.message, error.errors);
    return NextResponse.json({ error: error.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }

    const newItem = await (db as any).Campaign.create({ subject, content });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Campaign POST error:", error.message, error.errors);
    return NextResponse.json({ error: error.message || "Failed to create campaign" }, { status: 500 });
  }
}
