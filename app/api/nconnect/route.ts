import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const getValidModes = (meetingType?: string) =>
  meetingType === "workshop" ? ["online", "offline", "hybrid"] : ["online", "offline"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  try {
    const whereClause = type ? { meeting_type: type } : {};
    const model = db as any;
    const items = await model.NConnect.findAll({ where: whereClause, order: [["createdAt", "DESC"]] });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const isWorkshop = body.meeting_type === "workshop";
    const validModes = getValidModes(body.meeting_type);

    if (body.mode !== undefined && !validModes.includes(body.mode)) {
      return NextResponse.json(
        { error: isWorkshop ? "Mode must be online, offline, or hybrid" : "Mode must be online or offline" },
        { status: 400 }
      );
    }
    const model = db as any;
    const newItem = await model.NConnect.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create item" }, { status: 500 });
  }
}
