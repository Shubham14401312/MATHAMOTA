# MATHAMOTA

MATHAMOTA is a private two-person chat app foundation built as a deployable PWA with:

- real-time messaging
- emoji and sticker tray
- media/file sharing
- wallpaper themes
- gallery visibility controls
- admin-only analytics panel
- installable web app support
- lightweight multiplayer game panel
- Android/iOS wrapper stubs

This is a realistic first delivery, not a full WhatsApp/Messenger clone. It is structured so you can deploy it, extend it, and keep secrets out of the repository.

## Upload-ready repo flow

If you want the shortest path:

1. Upload this folder to a new GitHub repository
2. Deploy it to Render using [render.yaml](/C:/Users/shubh/MATHAMOTA/render.yaml)
3. Add the required secrets in Render
4. Build the Android wrapper separately only if you want an APK download

## Stack

- Web: React + Vite PWA
- API: Node.js + Express + Socket.IO + SQLite
- Android wrapper: Java WebView shell
- iOS wrapper: Swift WKWebView shell
- Native core stub: C++ secure codec interface

## Security model

- No OTP flow
- Admin access uses runtime environment variables, not hardcoded source secrets
- Transport security is intended via HTTPS/WSS in deployment
- At-rest data protection is handled server-side
- The admin can see data in the dashboard, so this is **not** true end-to-end encryption

Read [docs/SECURITY.md](/C:/Users/shubh/MATHAMOTA/docs/SECURITY.md) before publishing.

## Quick start

1. Copy `.env.example` to `.env`
2. Set a strong `JWT_SECRET`
3. Set `ADMIN_EMAIL`
4. Set `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` locally or in your hosting platform secret manager
   To generate a hash instead of storing the plain password:

```powershell
$env:ADMIN_PASSWORD='your-secret'
node apps/api/src/security.js
```

5. Install packages:

```powershell
cmd /c npm install
```

6. Run the app:

```powershell
cmd /c npm run dev
```

7. Build the web app:

```powershell
cmd /c npm run build
```

8. Start the production server locally:

```powershell
cmd /c npm run start
```

Detailed publishing steps are in [docs/DEPLOY.md](/C:/Users/shubh/MATHAMOTA/docs/DEPLOY.md).
