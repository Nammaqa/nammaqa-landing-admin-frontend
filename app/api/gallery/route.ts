import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const items = await (db as any).Gallery.findAll({ order: [['createdAt', 'DESC']] });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support array of gallery items
    if (Array.isArray(body)) {
      const newItems = await (db as any).Gallery.bulkCreate(body);
      return NextResponse.json(newItems, { status: 201 });
    }

    // Support single request with multiple image_urls
    if (Array.isArray(body?.image_urls) && body.image_urls.length > 0) {
      const records = body.image_urls.map((url: string) => ({
        image_url: url,
        image_title: body.image_title || null,
        date: body.date || null,
        description: body.description || null,
        hashtags: body.hashtags || null,
      }));
      const newItems = await (db as any).Gallery.bulkCreate(records);
      return NextResponse.json(newItems, { status: 201 });
    }

    // Support standard single gallery item
    const newItem = await (db as any).Gallery.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery item(s):", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
