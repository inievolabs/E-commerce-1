const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/";

export const LEAKED_PASSWORD_MESSAGE =
  "This password has appeared in a data breach. Please choose a different password.";

async function sha1Hex(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/** k-anonymity check against Have I Been Pwned (browser or Workers). */
export async function isPasswordPwned(password: string): Promise<boolean> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`${HIBP_RANGE_URL}${prefix}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!response.ok) {
    throw new Error(`HIBP lookup failed (${response.status})`);
  }

  const body = await response.text();
  return body.split("\n").some((line) => line.startsWith(`${suffix}:`));
}

export async function assertPasswordNotPwned(password: string): Promise<void> {
  if (await isPasswordPwned(password)) {
    throw new Error(LEAKED_PASSWORD_MESSAGE);
  }
}
