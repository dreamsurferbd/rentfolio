import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, html, attachments = [] }) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject,
    html,
    attachments,
  };
  return sgMail.send(msg);
}

