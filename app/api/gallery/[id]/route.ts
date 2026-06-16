import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const item = await db.Gallery.findByPk(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.update(body);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await db.Gallery.findByPk(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
