import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

/**
 * POST /api/contact — sends the contact form to João via Resend.
 * Env: RESEND_API_KEY (required), CONTACT_TO (default below), CONTACT_FROM (a verified Resend sender).
 */
const TO = process.env.CONTACT_TO ?? 'meneses-joao@hotmail.com'
const FROM = process.env.CONTACT_FROM ?? 'Portfolio <onboarding@resend.dev>'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  const { name, email, message, company } = (req.body ?? {}) as Record<string, unknown>
  if (typeof company === 'string' && company.length > 0) return res.status(200).json({ ok: true }) // honeypot

  const valid =
    typeof name === 'string' && name.trim().length > 0 && name.length <= 120 &&
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200 &&
    typeof message === 'string' && message.trim().length > 0 && message.length <= 4000
  if (!valid) return res.status(400).json({ error: 'invalid_payload' })

  const key = process.env.RESEND_API_KEY
  if (!key) return res.status(503).json({ error: 'email_not_configured' })

  const idem = req.headers['idempotency-key']
  const resend = new Resend(key)
  const { error } = await resend.emails.send(
    {
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `devmeneses.com — new message from ${name}`,
      html: `<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    },
    typeof idem === 'string' ? { idempotencyKey: idem } : undefined,
  )
  if (error) return res.status(502).json({ error: 'send_failed' })
  return res.status(200).json({ ok: true })
}
