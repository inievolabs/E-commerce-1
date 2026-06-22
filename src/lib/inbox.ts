import { z } from "zod";

export const contactSubmissionSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: z.string().trim().email("Enter a valid email address.").max(200),
  subject: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(5000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(200),
  source: z.string().trim().max(50).optional().nullable(),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export type ContactSubmissionStatus = "new" | "read" | "archived";

export interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string | null;
  message: string;
  status: ContactSubmissionStatus;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
}
