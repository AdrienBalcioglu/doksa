import { Resend } from 'resend';
import supabase from './lib/supabase.js';

const resend = new Resend(process.env.RESEND_API_KEY);

function stars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

function reviewSummary(review) {
  return `${stars(review.rating)} — ${review.author ?? 'Anonymous'}\n"${review.body ?? ''}"`;
}

async function sendSlack(webhookUrl, app, reviews) {
  const blocks = reviews.map((r) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${stars(r.rating)} ${r.rating}/5* — ${r.author ?? 'Anonymous'} (${r.platform})\n>${r.body ?? ''}`,
    },
  }));

  const payload = {
    text: `:warning: ${reviews.length} low-rated review(s) for *${app.name}*`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `⚠️ New low-rated reviews — ${app.name}` } },
      ...blocks,
    ],
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Slack webhook failed: ${res.status}`);
}

async function sendEmail(email, app, reviews) {
  const reviewLines = reviews.map(reviewSummary).join('\n\n');

  await resend.emails.send({
    from: 'Doksa <alerts@doksa.io>',
    to: email,
    subject: `⚠️ ${reviews.length} low-rated review(s) for ${app.name}`,
    text: `You have new low-rated reviews for ${app.name}:\n\n${reviewLines}\n\n— Doksa`,
    html: `
      <h2>⚠️ New low-rated reviews for <strong>${app.name}</strong></h2>
      ${reviews
        .map(
          (r) => `
        <div style="border-left:3px solid #ef4444;padding:12px;margin:12px 0">
          <strong>${stars(r.rating)} ${r.rating}/5</strong> — ${r.author ?? 'Anonymous'}
          <span style="color:#6b7280;font-size:12px">(${r.platform})</span>
          <p style="margin:8px 0 0">${r.body ?? ''}</p>
        </div>`
        )
        .join('')}
      <p style="color:#6b7280;font-size:12px">Sent by Doksa</p>
    `,
  });
}

export async function triggerAlerts(app, newReviews) {
  const { data: alerts, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('app_id', app.id)
    .eq('active', true);

  if (error || !alerts?.length) return;

  for (const alert of alerts) {
    const matching = newReviews.filter((r) => r.rating <= alert.min_rating);
    if (!matching.length) continue;

    try {
      if (alert.channel === 'slack' && alert.webhook_url) {
        await sendSlack(alert.webhook_url, app, matching);
      } else if (alert.channel === 'email' && alert.email) {
        await sendEmail(alert.email, app, matching);
      }
    } catch (err) {
      console.error(`[alerts] failed to send ${alert.channel} alert:`, err.message);
    }
  }
}
