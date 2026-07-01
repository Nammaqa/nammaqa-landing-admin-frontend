import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

type SuccessStoryModel = {
  findAll(options?: unknown): Promise<unknown[]>;
  create(values: Record<string, unknown>): Promise<unknown>;
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

export async function GET() {
  try {
    const items = await SuccessStory.findAll({ order: [["createdAt", "DESC"]] });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newItem = await SuccessStory.create(normalizeSuccessStoryPayload(body));
    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
