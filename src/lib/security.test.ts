import { describe, expect, it } from "vitest";
import { placeOrderSchema } from "@/lib/place-order";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { buildContentSecurityPolicy, securityHeaders } from "@/lib/security-headers";
import { verifyOrderAgainstCatalog } from "@/lib/verify-order";

describe("placeOrderSchema", () => {
  it("rejects manipulated negative prices in payload", () => {
    const result = placeOrderSchema.safeParse({
      customerName: "Test User",
      customerEmail: "test@example.com",
      customerPhone: "01700000000",
      shippingAddress: "Dhaka",
      subtotal: -100,
      shipping: 0,
      total: -100,
      items: [
        {
          productId: "w-bag-01",
          name: "Bag",
          price: -50,
          qty: 1,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid checkout payload", () => {
    const result = placeOrderSchema.safeParse({
      customerName: "Test User",
      customerEmail: "test@example.com",
      customerPhone: "01700000000",
      shippingAddress: "Dhaka",
      subtotal: 1480,
      shipping: 0,
      total: 1480,
      items: [
        {
          productId: "w-bag-01",
          name: "Bag",
          price: 1480,
          qty: 1,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("verifyOrderAgainstCatalog", () => {
  it("uses database prices instead of client-submitted prices", () => {
    const result = verifyOrderAgainstCatalog(
      {
        customerName: "A",
        customerEmail: "a@b.com",
        customerPhone: "017",
        shippingAddress: "Dhaka",
        subtotal: 1,
        shipping: 0,
        total: 1,
        items: [{ productId: "w-bag-01", name: "Bag", price: 1, qty: 2 }],
      },
      [{ id: "w-bag-01", name: "Marais Shoulder Bag", price: 1480 }],
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.subtotal).toBe(2960);
      expect(result.order.items[0].price).toBe(1480);
    }
  });

  it("rejects unknown product ids", () => {
    const result = verifyOrderAgainstCatalog(
      {
        customerName: "A",
        customerEmail: "a@b.com",
        customerPhone: "017",
        shippingAddress: "Dhaka",
        subtotal: 0,
        shipping: 0,
        total: 0,
        items: [{ productId: "fake-id", name: "X", price: 0, qty: 1 }],
      },
      [],
    );
    expect(result.ok).toBe(false);
  });
});

describe("rate limiting", () => {
  it("blocks after max requests in window", () => {
    const store = new Map();
    const config = { windowMs: 60_000, max: 3 };

    expect(checkRateLimit(store, "ip:1", config, 1_000).ok).toBe(true);
    expect(checkRateLimit(store, "ip:1", config, 2_000).ok).toBe(true);
    expect(checkRateLimit(store, "ip:1", config, 3_000).ok).toBe(true);
    const blocked = checkRateLimit(store, "ip:1", config, 4_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("reads Cloudflare client IP header", () => {
    const headers = new Headers({ "cf-connecting-ip": "203.0.113.10" });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.10");
  });
});

describe("security headers", () => {
  it("includes CSP with Supabase and Cloudinary hosts", () => {
    const csp = buildContentSecurityPolicy("https://velinstudiobd.com");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("https://res.cloudinary.com");
    expect(csp).toContain("https://api.pwnedpasswords.com");
  });

  it("sets standard hardening headers", () => {
    const headers = securityHeaders();
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Content-Security-Policy"]).toBeTruthy();
  });
});
