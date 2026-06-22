# Development Setup & Backup Guide

How to keep **Velin Studio** safe for future work: local development on your PC + GitHub backup.

---

## Short answer

| Question | Answer |
|----------|--------|
| Keep developing from `D:\Failed\velinstudio`? | **Yes** — this is your main working copy |
| Need GitHub too? | **Yes** — backup, history, second machine, disaster recovery |
| Is `.env.local` backed up to GitHub? | **No** (and it must not be) — keep a separate secure copy |

---

## Recommended layout

```
Your PC (primary)
  D:\Failed\velinstudio\     ← day-to-day development here
  D:\Backups\velinstudio\    ← optional: occasional zip copy

GitHub (remote backup)
  https://github.com/abumdselim/velinstudio.git
```

**Rule:** Code lives in Git. Secrets live outside Git.

---

## What goes where

### Commit to GitHub (safe to push)

- All source: `src/`, `supabase/migrations/`, `scripts/`, `public/`
- Config templates: `.env.example`, `package.json`, `vite.config.ts`, `wrangler.toml`
- Docs: `docs/`, `DEPLOY.md`, `SECURITY.md`
- CI: `.github/workflows/`

### Never commit

- `.env.local` — Supabase keys, Cloudinary secrets (already in `.gitignore`)
- `node_modules/` — reinstall with `npm install`
- `.output/`, `dist/` — rebuild with `npm run build`

### Keep a private backup (not in repo)

Copy these to a password manager or encrypted folder:

| Item | Why |
|------|-----|
| `.env.local` | Local + deploy secrets |
| Supabase dashboard login | Database access |
| Cloudflare account | Production deploy |
| Cloudinary credentials | Media upload |
| Admin user email/password | Store admin |

---

## Daily workflow

```powershell
cd D:\Failed\velinstudio

# 1. Start dev server
npm run dev

# 2. After a meaningful change
git status
git add .
git commit -m "Describe what changed and why"

# 3. Push backup to GitHub
git push origin main
```

**Before closing for the day:** `git push` if you committed — so GitHub matches your PC.

---

## First-time setup on this machine (already done)

You already have:

- Repo cloned at `D:\Failed\velinstudio`
- `origin` → `https://github.com/abumdselim/velinstudio.git`
- `.env.local` configured

After pulling on a new PC or fresh clone:

```powershell
git clone https://github.com/abumdselim/velinstudio.git
cd velinstudio
npm install
copy .env.example .env.local
# Fill .env.local from your secure backup
npm run dev
```

---

## Deploy to production (when ready)

```powershell
npm run deploy
```

Requires: `.env.local` filled + Cloudflare logged in (`npx wrangler login` once).

Production secrets are also stored on the Cloudflare Worker (see `DEPLOY.md`).

---

## Optional: extra local backup

Once a week or before big changes:

```powershell
# Zip without node_modules (smaller)
Compress-Archive -Path D:\Failed\velinstudio -DestinationPath D:\Backups\velinstudio-$(Get-Date -Format yyyy-MM-dd).zip
```

Or use **Git only** — if you push regularly, GitHub is enough for code.

---

## Lovable connection

This repo is linked to [Lovable](https://lovable.dev). Avoid:

- `git push --force` to `main`
- Rebasing/amending commits already pushed to `main`

Normal flow is fine: commit → push → Lovable syncs.

---

## Current status (check yourself)

```powershell
git status -sb
git log -3 --oneline
```

If you see many `??` or `M` files, work is **only on your PC** until you commit and push.

---

## Checklist: “project professionally saved”

- [ ] All code committed with clear messages
- [ ] Pushed to `origin/main` on GitHub
- [ ] `.env.local` backed up separately (password manager / encrypted USB)
- [ ] Supabase migrations in `supabase/migrations/` committed
- [ ] `docs/Managed-Website-Service-Agreement.md` and other docs committed
- [ ] You know how to run `npm run dev` and `npm run deploy`

---

## Quick commands reference

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Tests | `npm run test` |
| Build | `npm run build` |
| Deploy live | `npm run deploy` |
| Git status | `git status` |
| Push backup | `git push origin main` |
