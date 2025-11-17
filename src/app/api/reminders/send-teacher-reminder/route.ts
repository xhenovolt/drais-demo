import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
// @ts-expect-error - AfricasTalking doesn't have proper TypeScript definitions
import AfricasTalking from 'africastalking';

const africasTalkingClient = AfricasTalking({
  apiKey: 'atsk_3baf21e161cca165c4f5ccb67bc38f5a50a192e3208fafc3b575014f35793d9a1994a774',
  username: 'xhenovolt',
});

const sms = africasTalkingClient.SMS;

async function formatPhoneNumber(contact: string): Promise<string> {
  if (/^0\d{9}$/.test(contact)) {
    return '+256' + contact.substring(1);
  } else if (/^256\d{9}$/.test(contact)) {
    return '+' + contact;
  } else if (contact.startsWith('+256') && contact.length === 13) {
    return contact;
  } else {
    return contact.startsWith('+') ? contact : '+' + contact;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body.message;

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT p.phone FROM staff s JOIN people p ON s.person_id = p.id WHERE s.status = "active" AND p.phone IS NOT NULL'
    );
    await connection.end();

    const contacts = rows.map((row: any) => row.phone);
    if (contacts.length === 0) {
      // No teachers found, send to test number
      const testNumber = '+256741341483';
      const response = await sms.send({ to: [testNumber], message });
      return NextResponse.json({ success: true, message: 'No teachers found. Test SMS sent.', response });
    }

    // Send SMS to all teacher contacts
    const formattedContacts = await Promise.all(contacts.map(formatPhoneNumber));
    const response = await sms.send({ to: formattedContacts, message });
    return NextResponse.json({ success: true, message: 'SMS sent to all teachers.', response });
  } catch (error: any) {
    console.error('Error sending reminders:', error.message);
    return NextResponse.json({ error: 'Failed to send reminders. Please try again later.' }, { status: 500 });
  }
}
