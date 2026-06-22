#!/usr/bin/env node
/**
 * Enable Supabase Auth leaked-password (HIBP) protection via Management API.
 * Requires: SUPABASE_ACCESS_TOKEN in env (Personal Access Token from supabase.com/dashboard/account/tokens)
 * Note: password_hibp_enabled requires Pro plan or above on the organization.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const PROJECT_REF = "xkqkwoxrwezywnoillgf";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Missing SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens");
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    password_hibp_enabled: true,
    password_min_length: 8,
    password_required_characters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789",
  }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`Failed (${res.status}):`, text);
  process.exit(1);
}

console.log("Auth config updated — leaked password protection enabled.");
console.log(text);
