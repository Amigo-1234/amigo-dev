import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { LocalTime } from "@/components/local-time";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact",
  description: "Get in touch with Muftau Idris about a website, a web application or a role.",
});

export default function ContactPage() {
  return (
    <div className="shell pt-12 md:pt-20">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="label">Contact · Sheet 03</p>
          <h1 className="mt-6 font-serif text-display">
            Let&apos;s <em className="text-accent">talk.</em>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-fg-muted">
            Tell me about the website or application you need, the problem you&apos;re trying to solve, or the role
            you&apos;re hiring for. A few sentences is plenty.
          </p>

          <dl className="mt-12 border-t border-line text-sm">
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="label">Email</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="link-underline break-all text-fg">
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="label">GitHub</dt>
              <dd>
                <a href={site.social.github} target="_blank" rel="noopener noreferrer" className="link-underline text-fg">
                  @Amigo-1234 ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="label">LinkedIn</dt>
              <dd>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="link-underline text-fg">
                  Muftau Idris ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="label">Local time</dt>
              <dd className="font-mono text-fg">
                <LocalTime />
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7">
          <div className="ticks rounded-2xl border border-line bg-ink-raised/60 p-6 md:p-10">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
