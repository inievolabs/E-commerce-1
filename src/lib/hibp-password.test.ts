import { describe, expect, it, vi } from "vitest";
import { isPasswordPwned, LEAKED_PASSWORD_MESSAGE } from "@/lib/hibp-password";

describe("hibp-password", () => {
  it("detects known breached passwords via k-anonymity prefix", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "1E4C9B93F3F0682250B6CF8331B7EE68FD8:393386\n",
      }),
    );

    const pwned = await isPasswordPwned("password");
    expect(pwned).toBe(true);
    vi.unstubAllGlobals();
  });

  it("allows passwords not in breach list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "ABCDEF1234567890:2\n",
      }),
    );

    const pwned = await isPasswordPwned("unique-velin-studio-pass-2026");
    expect(pwned).toBe(false);
    vi.unstubAllGlobals();
  });

  it("exports a user-facing error message", () => {
    expect(LEAKED_PASSWORD_MESSAGE).toMatch(/data breach/i);
  });
});
