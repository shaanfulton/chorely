# Chorely (Frontend)

## Quick start

1) Start the demo backend (runs migrations + seeds, resets DB):

```bash
docker compose down && MUTE_DB_LOGS=true docker compose up --pull always --build
```

2) Set API base (use your computer's LAN IP for mobile):

```bash
# macOS
export EXPO_PUBLIC_API_BASE=http://$(ipconfig getifaddr en0):4000
# Windows
# set EXPO_PUBLIC_API_BASE=http://<your_ipv4>:4000
```

3) Run the app:

```bash
npm install
npx expo start
```

- On phone: same Wi‑Fi as your computer; scan the QR in Expo.
- Images: seed images served at `/seed/...`; new uploads at `/uploads/...` (uploads are ephemeral and clear on backend restart).
- Optional: create a `.env` with `MUTE_DB_LOGS=true` to mute DB query logs in the backend.

## Links
- DB Diagram: https://dbdiagram.io/d/68983724dd90d178653d33e4
- API Doc: https://github.com/lmmeqa/chorely-backend/blob/main/ApiDoc.md
- Postman Docs: https://documenter.getpostman.com/view/19704779/2sB3BEnVWP
