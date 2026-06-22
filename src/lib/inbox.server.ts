import { createSupabaseAdminClient } from "./supabase-server";
import {
  contactSubmissionSchema,
  newsletterSubscribeSchema,
  type ContactSubmission,
  type ContactSubmissionStatus,
  type NewsletterSubscriber,
} from "./inbox";

type ContactRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactSubmissionStatus;
  created_at: string;
};

type NewsletterRow = {
  id: string;
  email: string;
  source: string | null;
  created_at: string;
};

function mapContact(row: ContactRow): ContactSubmission {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapNewsletter(row: NewsletterRow): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function submitContactForm(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = contactSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e) => e.message).join(" ") };
  }

  const input = parsed.data;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contact_submissions").insert({
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email.toLowerCase(),
    subject: input.subject?.trim() || null,
    message: input.message,
  });

  if (error) {
    console.error("[submitContactForm]", error);
    return { ok: false, error: "Unable to send your message. Please try again." };
  }

  return { ok: true };
}

export async function subscribeNewsletter(
  raw: unknown,
): Promise<{ ok: true; alreadySubscribed?: boolean } | { ok: false; error: string }> {
  const parsed = newsletterSubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e) => e.message).join(" ") };
  }

  const email = parsed.data.email.toLowerCase();
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { ok: true, alreadySubscribed: true };
  }

  const { error } = await admin.from("newsletter_subscribers").insert({
    email,
    source: parsed.data.source?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true, alreadySubscribed: true };
    }
    console.error("[subscribeNewsletter]", error);
    return { ok: false, error: "Unable to subscribe. Please try again." };
  }

  return { ok: true };
}

export async function fetchAdminInbox(): Promise<{
  contacts: ContactSubmission[];
  newsletters: NewsletterSubscriber[];
}> {
  const admin = createSupabaseAdminClient();

  const [contactsRes, newslettersRes] = await Promise.all([
    admin
      .from("contact_submissions")
      .select("id, first_name, last_name, email, subject, message, status, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("newsletter_subscribers")
      .select("id, email, source, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (contactsRes.error) throw contactsRes.error;
  if (newslettersRes.error) throw newslettersRes.error;

  return {
    contacts: (contactsRes.data ?? []).map((row) => mapContact(row as ContactRow)),
    newsletters: (newslettersRes.data ?? []).map((row) => mapNewsletter(row as NewsletterRow)),
  };
}

export async function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmissionStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contact_submissions").update({ status }).eq("id", id);
  if (error) {
    console.error("[updateContactSubmissionStatus]", error);
    return { ok: false, error: "Unable to update submission." };
  }
  return { ok: true };
}
