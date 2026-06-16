import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  try {
    const resolvedParams = typeof params?.then === 'function' ? await params : params;
    const { id } = resolvedParams;
    const body = await req.json();
    const item = await (db as any).Blog.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.update(body);
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  try {
    const resolvedParams = typeof params?.then === 'function' ? await params : params;
    const { id } = resolvedParams;
    const item = await (db as any).Blog.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
