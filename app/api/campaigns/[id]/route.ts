import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await (db as any).Campaign.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }

    const item = await (db as any).Campaign.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.update({ subject, content });
    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Campaign PUT error:", error.message, error.errors);
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await (db as any).Campaign.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}
