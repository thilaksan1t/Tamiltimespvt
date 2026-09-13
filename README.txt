TamilTimes Finance – Cloudflare Worker + Static Assets

Recipient: thilaksan1t@gmail.com

Required Cloudflare Worker Secret:
RESEND_API_KEY = your Resend API key

Optional Cloudflare Worker variables:
TO_EMAIL = recipient email (defaults to thilaksan1t@gmail.com)
FROM_EMAIL = verified sender email/domain in Resend

Important:
1. Verify tamiltimespvt.uk (or another sender domain) in Resend.
2. Add RESEND_API_KEY under Worker > Settings > Variables and Secrets.
3. Deploy the Worker.
4. Keep the static assets in ./public.
5. The application form posts to /api/apply and the Worker sends the uploaded documents by email.
