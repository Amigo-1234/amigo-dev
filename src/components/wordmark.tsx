import { site } from "@/content/site";

/** AMIGODEV wordmark with the owner's name as a quiet second line. */
export function Wordmark() {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden="true" className="relative grid size-8 place-items-center rounded-[3px] border border-line-strong">
        <svg viewBox="0 0 32 32" className="size-5 text-fg">
          {/* An "A" drawn as a section line with a datum point. */}
          <path d="M6 26 16 6l10 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path d="M10.5 18h11" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="18" r="2.2" fill="var(--accent)" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-mono text-[0.8125rem] font-medium tracking-[0.18em] text-fg">
          AMIGO<span className="text-accent">DEV</span>
        </span>
        <span className="mt-1 hidden text-[0.6875rem] tracking-wide text-fg-subtle xs:block">{site.name}</span>
      </span>
    </span>
  );
}
