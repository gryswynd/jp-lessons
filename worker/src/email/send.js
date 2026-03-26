/**
 * Send an email via the Resend API.
 * https://resend.com/docs/api-reference/emails/send-email
 */

export async function sendEmail({ to, subject, html, senderEmail, apiKey }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Rikizo <' + senderEmail + '>',
      to: [to],
      subject: subject,
      html: html
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error('Resend API error (' + res.status + '): ' + body);
  }

  return res.json();
}
