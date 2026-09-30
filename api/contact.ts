/**
 * Contact form endpoint — a Vercel Function, deployed from /api alongside
 * the static Astro build.
 *
 * Why here and not src/pages/api: the site builds with `output: "static"`
 * and no adapter, so an Astro API route is silently dropped from the build
 * and the form POSTs into a 404. A root /api function needs no adapter and
 * keeps every page static.
 *
 * Env:
 *   RESEND_API_KEY      required
 *   CONTACT_TO_EMAIL    where leads go; defaults to business.email
 *   CONTACT_FROM_EMAIL  verified Resend sender; defaults to noreply@warleyd.com
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Resend } from "resend";

// Read at runtime; vercel.json `includeFiles` ships the file with the function.
const data = JSON.parse(readFileSync(join(process.cwd(), "src/site-data.json"), "utf8"));
const business = data.business as { name: string; email: string };
const errors = data.form.errors as { name: string; email: string; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS: Record<string, number> = { name: 120, email: 200, phone: 40, organization: 200, role: 60, message: 5000 };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function POST(request: Request): Promise<Response> {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const field = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim().slice(0, LIMITS[k] ?? 200) : "");
  const f = {
    name: field("name"),
    email: field("email"),
    phone: field("phone"),
    organization: field("organization"),
    role: field("role"),
    message: field("message"),
  };

  // Honeypot: people never see this field. Pretend success so bots move on.
  if (typeof raw.website === "string" && raw.website.trim() !== "") return json({ success: true }, 200);

  if (!f.name) return json({ error: errors.name, field: "name" }, 400);
  if (!EMAIL.test(f.email)) return json({ error: errors.email, field: "email" }, 400);
  if (!f.message) return json({ error: errors.message, field: "message" }, 400);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("contact: RESEND_API_KEY is not set");
    return json({ error: "Not configured" }, 500);
  }

  const rows = [
    ["Name", f.name],
    ["Email", f.email],
    ["Phone", f.phone],
    ["I am a", f.role],
    ["School or organization", f.organization],
  ].filter(([, v]) => v);

  const { error } = await new Resend(apiKey).emails.send({
    from: `${business.name} Website <${process.env.CONTACT_FROM_EMAIL || "noreply@warleyd.com"}>`,
    to: process.env.CONTACT_TO_EMAIL || business.email,
    replyTo: f.email,
    subject: `New inquiry from ${f.name}${f.role ? ` (${f.role})` : ""}`,
    html: `
      <h2>New website inquiry</h2>
      <table cellpadding="4">${rows.map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`).join("")}</table>
      <p><strong>Message</strong></p>
      <p style="white-space:pre-wrap">${esc(f.message)}</p>
      <hr /><p style="color:#666;font-size:12px">Sent from the ${esc(business.name)} website. Reply to this email to answer ${esc(f.name)} directly.</p>
    `,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${f.message}`,
  });

  if (error) {
    console.error("contact: Resend error", error);
    return json({ error: "Failed to send" }, 502);
  }
  return json({ success: true }, 200);
}
