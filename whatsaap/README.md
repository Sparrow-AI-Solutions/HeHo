# HeHo WhatsApp Railway Template (`whatsaap/`)

This folder is a ready template for Railway deployment.

## 1) Create a GitHub repo for this template
- Put the files from this folder into a new repo.
- Push to GitHub.

## 2) Create Railway Template ID
1. Open Railway.
2. Deploy this repo once.
3. From project settings, create a **Template**.
4. Copy the **Template ID**.

## 3) Connect from HeHo app
1. Open your chatbot settings → Deploy → **Intreagtion**.
2. In **Connect to WhatsApp (Railway Template)** paste your Railway Deploy URL button (or Template ID).
3. Click **Deploy WhatsApp on Railway**.
4. HeHo already includes a default hardcoded Railway deploy URL button link for quick start.

HeHo sends these env vars automatically in the Railway URL:
- `HEHO_API` (your app API base, e.g. `https://heho.vercel.app/api`)
- `HEHO_API_KEY`
- `CHATBOT_ID`

## 4) Deploy on Railway
- Railway opens with env vars prefilled.
- Click Deploy.
- Bot notifies HeHo it is deployed (`/api/whatsapp/deployed`).
- Bot starts and prints QR.
- QR is also sent to HeHo via `/api/whatsapp/qr` and shown in UI.

## 5) Scan QR and confirm status
- Scan QR using WhatsApp linked device.
- Bot calls `/api/whatsapp/connected`.
- HeHo UI status changes to **✅ Connected**.

## 6) Message flow
User (WhatsApp) → Railway bot → HeHo `/api/aichat` → reply back to WhatsApp.

## Important production note
Current HeHo QR/status APIs use in-memory store. For multi-instance production, replace with DB/Redis.

## Railway crash fix (missing Chrome libs)
This template now includes a `Dockerfile` that installs Chromium + required Linux libs (including `libglib2.0-0`) so `whatsapp-web.js` can launch correctly on Railway.

## Security / same-user guarantee
QR/status callbacks now require `Authorization: Bearer <HEHO_API_KEY>`, and HeHo validates chatbot ownership before updating QR/status.
