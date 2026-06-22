# Security notes — Velin Studio

## Automated checks

- `npm run test` — order validation, rate limiting, CSP headers
- GitHub Actions — lint, tests, build on every push/PR

## HTTP hardening (production)

Applied on every response via `src/server.ts` and static `public/_headers`:

- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## API rate limits (per IP)

| Route | Limit |
|-------|-------|
| `POST /api/orders` | 12 / 15 min |
| `POST /api/upload-media` | 40 / hour |
| `GET /api/admin/customers` | 60 / min |

## Supabase advisors

Re-run after schema changes:

```bash
# Via Supabase Dashboard → Database → Advisors
# Or Cursor Supabase MCP: get_advisors (security + performance)
```

### Manual dashboard setting

Enable **Leaked password protection** in Supabase Auth (requires **Pro plan**):

[Password security guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

Dashboard → Authentication → Providers → Email → Prevent use of leaked passwords.

Or with a [Personal Access Token](https://supabase.com/dashboard/account/tokens):

```bash
# Add SUPABASE_ACCESS_TOKEN to .env.local, then:
npm run auth:enable-hibp
```

### App-level HIBP (Free plan)

Signup, password reset, and change-password flows call Have I Been Pwned (k-anonymity) in the browser before Supabase Auth accepts the password.

## Secrets

Never commit `.env.local`. Server-only keys:

- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDINARY_API_SECRET`

Client-safe:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
