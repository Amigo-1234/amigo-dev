"use client";

import { useRef, useState } from "react";

import { site } from "@/content/site";
import { cn } from "@/lib/cn";

/*
 * Messages are delivered with EmailJS's REST API from the browser. These IDs
 * are public by design (EmailJS restricts use by allowed origin); they can be
 * overridden with NEXT_PUBLIC_EMAILJS_* variables. No secret lives here.
 */
const EMAILJS = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_wcfaccn",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_6ih1q9f",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "jvdJnyZxBNqyaEdjB",
};

const topics = ["A project for my business or organisation", "A role or opportunity", "Something else"] as const;

type Fields = { name: string; email: string; topic: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = { state: "idle" | "sending" | "sent" | "failed"; detail?: string };

const MIN_FILL_MS = 3000;

function validate(f: Fields): Errors {
  const errors: Errors = {};
  if (f.name.trim().length < 2) errors.name = "Please tell me your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) errors.email = "Please enter an email address I can reply to.";
  if (!f.topic) errors.topic = "Please choose what this is about.";
  if (f.message.trim().length < 20) errors.message = "A little more detail helps — at least 20 characters.";
  if (f.message.length > 5000) errors.message = "Please keep it under 5,000 characters.";
  return errors;
}

function mailtoHref(f: Fields) {
  const subject = encodeURIComponent(`${f.topic || "Hello"} — from ${f.name || "your portfolio"}`);
  const body = encodeURIComponent(`${f.message}\n\n${f.name}\n${f.email}`);
  return `mailto:${site.email}?subject=${subject}&body=${body}`;
}

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [startedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [fields, setFields] = useState<Fields>({ name: "", email: "", topic: "", message: "" });

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem("company") as HTMLInputElement | null)?.value;

    const found = validate(fields);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as (keyof Fields)[])[0];
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    // Bots fill hidden fields and submit instantly. Pretend success, send nothing.
    if (honeypot || Date.now() - startedAt < MIN_FILL_MS) {
      setStatus({ state: "sent" });
      return;
    }

    setStatus({ state: "sending" });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          service_id: EMAILJS.serviceId,
          template_id: EMAILJS.templateId,
          user_id: EMAILJS.publicKey,
          template_params: {
            name: fields.name.trim(),
            email: fields.email.trim(),
            subject: fields.topic,
            message: fields.message.trim(),
          },
        }),
      });
      if (!res.ok) throw new Error(`Email service responded ${res.status}`);
      setStatus({ state: "sent" });
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      setStatus({ state: "failed", detail: aborted ? "The email service took too long to answer." : "The email service didn't accept the message." });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="rounded-xl border border-line p-8 md:p-10">
        <p className="label text-ok">Message sent</p>
        <p className="mt-4 font-serif text-4xl">Thank you{fields.name ? `, ${fields.name.split(" ")[0]}` : ""}.</p>
        <p className="mt-3 text-fg-muted">I&apos;ll reply to {fields.email || "you"} as soon as I can.</p>
        <button
          type="button"
          onClick={() => {
            setFields({ name: "", email: "", topic: "", message: "" });
            setStatus({ state: "idle" });
          }}
          className="mt-8 text-sm text-fg underline decoration-line-strong underline-offset-4 hover:decoration-fg"
        >
          Send another message
        </button>
      </div>
    );
  }

  const field = "mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-base text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:bg-transparent";

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      // Without JavaScript the browser falls back to the visitor's email app.
      action={`mailto:${site.email}`}
      method="post"
      encType="text/plain"
      className="space-y-6"
      aria-describedby="form-note"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            value={fields.name}
            onChange={update("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(field, errors.name ? "border-accent" : "border-line")}
          />
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-accent">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={fields.email}
            onChange={update("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(field, errors.email ? "border-accent" : "border-line")}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-accent">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">What is this about?</legend>
        <div className="mt-3 flex flex-wrap gap-2" aria-describedby={errors.topic ? "topic-error" : undefined}>
          {topics.map((t) => (
            <label
              key={t}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                fields.topic === t ? "border-fg bg-fg text-ink" : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              <input type="radio" name="topic" value={t} checked={fields.topic === t} onChange={update("topic")} className="sr-only" required />
              {t}
            </label>
          ))}
        </div>
        {errors.topic && (
          <p id="topic-error" className="mt-2 text-sm text-accent">
            {errors.topic}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          value={fields.message}
          onChange={update("message")}
          placeholder="What are you building, and what do you need help with?"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(field, "resize-y", errors.message ? "border-accent" : "border-line")}
        />
        {errors.message && (
          <p id="message-error" className="mt-2 text-sm text-accent">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status.state === "failed" && (
        <div role="alert" className="rounded-lg border border-accent/50 bg-accent-soft p-4 text-sm">
          <p className="font-medium text-fg">Your message wasn&apos;t sent. {status.detail}</p>
          <p className="mt-1 text-fg-muted">
            Nothing is lost:{" "}
            <a href={mailtoHref(fields)} className="text-fg underline underline-offset-4">
              open it in your email app
            </a>{" "}
            or write to <span className="break-all text-fg">{site.email}</span>.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={status.state === "sending"}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-fg px-7 text-sm font-medium text-ink transition-[transform,opacity] hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {status.state === "sending" ? (
            <>
              <span aria-hidden="true" className="size-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              Sending…
            </>
          ) : (
            <>
              Send message <span aria-hidden="true">→</span>
            </>
          )}
        </button>
        <p id="form-note" className="text-sm text-fg-subtle">
          Your details are only used to reply to you.
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {status.state === "sending" ? "Sending your message" : ""}
      </p>
    </form>
  );
}
