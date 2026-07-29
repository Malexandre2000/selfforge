import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM = "SelfForge <onboarding@resend.dev>";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function wrapEmail(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #0A0908;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #78746C;">SelfForge — your AI self-improvement coach</p>
    </div>
  `;
}

// Beta volume is low and this fires from admin actions / redemption, not a
// hot path — logging and swallowing failures here keeps a Resend outage
// from breaking the invite/signup flow itself.
async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] send failed", err);
  }
}

export async function sendWelcomeEmail(email: string, name: string | null) {
  const greeting = name ? `Hey ${name},` : "Hey,";
  await send(
    email,
    "Welcome to SelfForge",
    wrapEmail(
      "Welcome to the beta",
      `<p>${greeting}</p>
       <p>You're in. Your AI coach is ready whenever you are — head to your dashboard to get your first roadmap.</p>
       <p><a href="${APP_URL}/dashboard" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0A0908;color:#fff;border-radius:999px;text-decoration:none;">Go to your dashboard</a></p>
       <p>You're one of the first people using SelfForge, so if anything feels off or you have an idea, use the feedback button in the app — we read every one.</p>`,
    ),
  );
}

export async function sendBetaInviteEmail(email: string, inviteCode: string, name: string | null) {
  const greeting = name ? `Hey ${name},` : "Hey,";
  const joinUrl = `${APP_URL}/beta/join?code=${inviteCode}`;
  await send(
    email,
    "You're invited to SelfForge",
    wrapEmail(
      "You're in the beta",
      `<p>${greeting}</p>
       <p>A spot just opened up in the SelfForge private beta. Use the link below to claim it — free, full access, no card required.</p>
       <p><a href="${joinUrl}" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#0A0908;color:#fff;border-radius:999px;text-decoration:none;">Claim your invite</a></p>
       <p style="font-size:13px;color:#78746C;">Or use this code at sign-up: <strong>${inviteCode}</strong></p>`,
    ),
  );
}
