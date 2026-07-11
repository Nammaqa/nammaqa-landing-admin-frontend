import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type SuccessStoryRecord = {
  update(values: Record<string, unknown>): Promise<SuccessStoryRecord>;
  destroy(): Promise<void>;
};

type SuccessStoryModel = {
  findByPk(id: string): Promise<SuccessStoryRecord | null>;
};

const SuccessStory = (db as unknown as { SuccessStory: SuccessStoryModel }).SuccessStory;

function normalizeSuccessStoryPayload(body: Record<string, unknown>) {
  return {
    student_name: body.student_name,
    student_image: body.student_image,
    student_type: body.student_type || "Student",
    college_name: body.college_name,
    feedback: body.feedback,
    student_package: body.student_package,
  };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const item = await SuccessStory.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.update(normalizeSuccessStoryPayload(body));
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await SuccessStory.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await item.destroy();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
