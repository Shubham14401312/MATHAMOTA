# Deploy Guide

## Fastest deployment

The easiest production path is:

1. Push this repo to GitHub
2. Create a Render web service from the repo
3. Let Render detect [render.yaml](/C:/Users/shubh/MATHAMOTA/render.yaml)
4. Add secrets in Render dashboard
5. Deploy

## Recommended hosting

- Single full-stack service: Render, Railway, Fly.io, or a VPS with HTTPS
- Database: keep SQLite only for single-instance deployment; use Postgres for scale
- Files: move uploads to S3-compatible storage for production

## Local run

```powershell
Copy-Item .env.example .env
cmd /c npm install
cmd /c npm run dev
```

## Environment variables

- `PORT`
- `CLIENT_ORIGIN`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_PASSWORD_HASH`
- `UPLOAD_MAX_MB`
- `PUBLIC_APP_URL`
- `VITE_API_URL`

If you prefer not to keep a plain admin password in the deployment environment, generate `ADMIN_PASSWORD_HASH` locally:

```powershell
$env:ADMIN_PASSWORD='your-secret'
node apps/api/src/security.js
```

## GitHub publishing

1. Create a new GitHub repository.
2. Push the `MATHAMOTA` folder.
3. Do not commit your real `.env`.
4. Add hosting secrets, especially `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH`.
5. Set `PUBLIC_APP_URL` to your final domain.
6. Deploy the app as a Node service.
7. For GitHub Pages alone, this full stack will not work because the API and database need a server runtime.

## Render values

- `NODE_ENV=production`
- `PORT=8080`
- `CLIENT_ORIGIN=https://mathamota.onrender.com`
- `PUBLIC_APP_URL=https://mathamota.onrender.com`
- `JWT_SECRET=<long-random-secret>`
- `ADMIN_EMAIL=<your-email>`
- `ADMIN_PASSWORD_HASH=<generated-hash>`

If Render assigns a different hostname, replace `mathamota.onrender.com` with your actual Render URL.

## Android APK

GitHub Pages cannot generate a trusted APK for users by itself. Use the Android wrapper in `native/android`, build it in Android Studio, sign it, and host the signed APK or publish it through Play Console.

## Permissions and trust

If you request many permissions, the app may look suspicious unless:

- permissions are justified in the manifest
- the APK is signed properly
- the app has a privacy policy
- the website uses HTTPS
- the package name and branding are consistent
