# mysweeper

A map of SF street sweeping schedules and residential parking permit (zone G)
areas — installable to a phone home screen, no app store required.

## Setup

1. Create a new GitHub repo and push everything in this folder to it.
2. In the repo's **Settings → Secrets and variables → Actions**, add a secret
   named `SOCRATA_APP_TOKEN` with your data.sf.gov app token.
3. In **Settings → Pages**, set the source to "Deploy from a branch",
   branch `main`, folder `/ (root)`.
4. In the **Actions** tab, run the "Sync SF data" workflow manually once
   (via "Run workflow") so `data/` gets populated instead of sitting empty.
5. Visit `https://<your-username>.github.io/<repo-name>/` — that's the live
   map. Share that link with anyone; no install or account needed to view it.

## Installing to a home screen

- **Android (Chrome):** open the link → menu (⋮) → "Add to Home screen."
- **iOS (Safari):** open the link → Share icon → "Add to Home Screen."

Once added, it opens full-screen like a native app and the service worker
lets the map shell load even with no signal — only the live data needs a
connection.

## Updating the data manually

If you don't want to wait for the daily scheduled sync:

```
SOCRATA_APP_TOKEN=your_token node scripts/sync.mjs
git add data/
git commit -m "Manual data sync"
git push
```
