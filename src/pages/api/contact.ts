import type { APIRoute } from "astro";
import { Resend } from "resend";
import { site } from "@/config/site";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { name: rawName, phone: rawPhone, message: rawMessage } = await request.json();

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const phone = typeof rawPhone === "string" ? rawPhone.trim() : "";
  const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

  // Server-side validation with field-specific errors
  if (!name) {
    return new Response(JSON.stringify({ error: "Please enter your name.", field: "name" }), { status: 400 });
  }
  if (!phone) {
    return new Response(JSON.stringify({ error: "Please enter your phone number.", field: "phone" }), { status: 400 });
  }
  if (!message) {
    return new Response(JSON.stringify({ error: "Please describe what you need.", field: "message" }), { status: 400 });
  }

  // Normalize phone to digits only (Postel's Law)
  const phoneDigits = phone.replace(/\D/g, "");

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: `${site.business.name} Website <noreply@warleyd.com>`,
    to: site.business.email,
    subject: `New quote request from ${name}`,
    html: `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phoneDigits}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr />
      <p style="color:#666;font-size:12px">Sent from ${site.business.name} website</p>
    `,
  });

  if (error) {
    return new Response(JSON.stringify({ error: "Failed to send" }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
