import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  if (!process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Contact form is not configured yet." }, { status: 500 });
  }

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New contact form message from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${String(message).replace(/\n/g, "<br/>")}</p>`,
  });

  return NextResponse.json({ success: true });
}
