# Security Notes

## Important limitation

You asked for both:

- private encrypted chat
- full admin visibility of all data

Those two goals conflict. If the owner/admin can read all content from the panel, the system is not true end-to-end encrypted. This project therefore uses:

- TLS/HTTPS in transit
- protected admin login
- server-side controlled data visibility
- secure secret handling through environment variables

## What is included

- No admin password hardcoded in source
- Helmet headers
- compressed transport
- JWT session auth
- invite-code based private room join
- upload size controls

## What you still need in production

- HTTPS reverse proxy
- signed Android APK/AAB
- malware-safe app signing and store metadata
- virus scanning for uploads
- rate limiting
- database backups
- object storage instead of local file uploads
- strict content moderation and abuse controls if expanded beyond private use

