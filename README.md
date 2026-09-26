# PepeCoin Mining Telegram Mini App

This is the first frontend/demo version for `@Pepecoinminings_bot`.

## Deploy to Vercel

1. Create a GitHub repository and upload all files from this folder.
2. In Vercel, import the GitHub repository.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.
7. Put the resulting HTTPS URL into BotFather -> your bot -> Mini App.

## Important

This version uses browser-side demo state. It is NOT a real financial/crypto backend.

Before real users, add:
- server-side Telegram `initData` validation
- database
- server-side reward/mining calculations
- anti-abuse/rate limiting
- task verification
- secure withdrawal processing
- admin authentication

Never put a Telegram bot token or private wallet key in frontend code.
