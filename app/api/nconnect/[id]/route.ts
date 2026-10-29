import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const getValidModes = (meetingType?: string) =>
  meetingType === "workshop" ? ["online", "offline", "hybrid"] : ["online", "offline"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const item = await (db as any).NConnect.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const meetingType = body.meeting_type || item.meeting_type;
    const isWorkshop = meetingType === "workshop";
    const validModes = getValidModes(meetingType);

    if (body.mode !== undefined && !validModes.includes(body.mode)) {
      return NextResponse.json(
        { error: isWorkshop ? "Mode must be online, offline, or hybrid" : "Mode must be online or offline" },
        { status: 400 }
      );
    }

    await item.update(body);
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await (db as any).NConnect.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.destroy();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
