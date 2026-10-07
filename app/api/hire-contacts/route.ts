import { NextResponse } from 'next/server';
import db from '@/models';

export async function GET() {
  try {
    // Ensure table exists
    await db.HireContact.sync();
    const contacts = await db.HireContact.findAll({
      order: [['createdAt', 'DESC']],
    });
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching hire contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, organizationName, phoneNumber, emailAddress } = body;

    // Ensure table exists
    await db.HireContact.sync();

    const newContact = await db.HireContact.create({
      firstName,
      lastName,
      organizationName,
      phoneNumber,
      emailAddress,
    });

    return NextResponse.json({ success: true, data: newContact }, { status: 201 });
  } catch (error) {
    console.error('Error creating hire contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
