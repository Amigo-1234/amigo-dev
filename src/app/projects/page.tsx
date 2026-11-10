import type { Metadata } from "next";
import Link from "next/link";

import { Chapter, Stamp } from "@/components/chapters";
import { Caption, Halftone, Panel, Registration, Sfx } from "@/components/comic";
import { ComicReader } from "@/components/comic-reader";
import { SpiderBot } from "@/components/spider-bot";
import { ButtonLink } from "@/components/ui";
import { building, buildingAsOf } from "@/content/building";
import { projects, smallerWork } from "@/content/projects";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  path: "/projects",
  title: "Projects",
  description:
    "Case studies by Muftau Idris (AMIGODEV), read as a comic: a social network, a live campus sports platform, a food ordering system, a bilingual school results platform and more.",
});

/*
 * The projects, as an issue of a comic you page through (ComicReader): the
 * cover with its contents, one page per project (featured first), what's on
 * the press right now, the client websites, and the back cover. The
 * spider-bot narrates; every claim on a page still comes from src/content.
 */
export default function ProjectsPage() {
  // Featured first, keeping the content file's order within each group.
  const ordered = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)];
  const live = projects.filter((p) => p.status.tone === "live").length;
  const inDev = projects.filter((p) => p.status.tone === "building").length;

  const pages = [
    { id: "cover", label: "Cover" },
    ...ordered.map((p) => ({ id: p.slug, label: p.name })),
    { id: "on-the-press", label: "On the press" },
    { id: "client-websites", label: "Client websites" },
    { id: "to-be-continued", label: "To be continued" },
  ];
  const no = (id: string) => String(pages.findIndex((p) => p.id === id) + 1).padStart(2, "0");
  const nextOf = (id: string) => pages[pages.findIndex((p) => p.id === id) + 1];

  return (
    <div className="shell pt-8 md:pt-12">
      <ComicReader pages={pages}>
        {/* ---- Cover ---------------------------------------------------- */}
        <ComicPage id="cover" folio={no("cover")} cover labelledBy="cover-title">
          <div className="comic-cover">
            <span aria-hidden="true" className="speed-lines" />
            <Halftone tone="red" from="right" className="absolute inset-y-0 right-0 -z-10 w-2/3 opacity-40" />

            <div className="comic-cover__masthead">
              <Caption as="span">AMIGODEV Comics · Issue #02</Caption>
              <span className="label">{projects.length} case studies · {live} live · {inDev} in development</span>
            </div>

            <h1 id="cover-title" className="comic-cover__title font-serif">
              <Registration>
                The case <em className="text-accent">files.</em>
              </Registration>
            </h1>
            <p className="comic-cover__lede">
              Schools, a kitchen, a campus sports community, a mosque and my own products. Each page says what is live,
              what is still being built and what I did.
            </p>

            <SpiderBot
              className="comic-cover__bot"
              says={
                <>
                  Real systems, real users. <span className="js-only">Turn the page with → or a swipe,</span> or
                  pick a chapter below.
                </>
              }
            />

            {/* Contents: links to each page (the reader opens them; without JavaScript they jump down). */}
            <nav aria-labelledby="contents-heading" className="comic-cover__contents">
              <h2 id="contents-heading" className="label text-fg">
                In this issue
              </h2>
              <ol>
                {ordered.map((p) => (
                  <li key={p.slug}>
                    <a href={`#${p.slug}`} className="contents-line">
                      <span className="contents-line__no">p.{no(p.slug)}</span>
                      <span className="contents-line__name font-serif">{p.name}</span>
                      <span className="contents-line__dots" aria-hidden="true" />
                      <span className="contents-line__kind">{p.kind}</span>
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#on-the-press" className="contents-line">
                    <span className="contents-line__no">p.{no("on-the-press")}</span>
                    <span className="contents-line__name font-serif">On the press</span>
                    <span className="contents-line__dots" aria-hidden="true" />
                    <span className="contents-line__kind">This fortnight</span>
                  </a>
                </li>
                <li>
                  <a href="#client-websites" className="contents-line">
                    <span className="contents-line__no">p.{no("client-websites")}</span>
                    <span className="contents-line__name font-serif">Client websites</span>
                    <span className="contents-line__dots" aria-hidden="true" />
                    <span className="contents-line__kind">{smallerWork.length} sites</span>
                  </a>
                </li>
              </ol>
            </nav>
          </div>
          <TurnCorner next={nextOf("cover")?.label} />
        </ComicPage>

        {/* ---- One page per project ------------------------------------- */}
        {ordered.map((project, i) => (
          <ComicPage key={project.slug} id={project.slug} folio={no(project.slug)} labelledBy={`chapter-${project.slug}`}>
            <Chapter project={project} index={i} headingLevel={2} label="Chapter" />
            <TurnCorner next={nextOf(project.slug)?.label} />
          </ComicPage>
        ))}

        {/* ---- On the press --------------------------------------------- */}
        <ComicPage id="on-the-press" folio={no("on-the-press")} labelledBy="press-title">
          <header className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Caption>Meanwhile, on the bench…</Caption>
              <h2 id="press-title" className="mt-5 font-serif text-title">
                <Registration>
                  On the press <em className="text-accent">right now.</em>
                </Registration>
              </h2>
            </div>
            <p className="max-w-sm text-fg-muted">Three projects with real commits in the past fortnight, as of {buildingAsOf}.</p>
          </header>
          <ol className="mt-8 grid gap-3 lg:grid-cols-3">
            {building.map((item) => (
              <li key={item.slug} className="min-w-0">
                <Panel className="relative flex h-full flex-col p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-mono text-[0.6875rem] tracking-wide text-fg-muted">{item.evidence}</p>
                    <Stamp tone="building" label={`Last commit ${item.lastCommit}`} />
                  </div>
                  <h3 className="mt-6 font-serif text-4xl leading-none">
                    <a href={`#${item.slug}`} className="link-underline">
                      {item.name}
                    </a>
                  </h3>
                  <p className="mt-4 leading-relaxed text-fg-muted">{item.now}</p>
                  <p className="mt-auto border-t border-line pt-4 text-sm text-fg">
                    <span className="label mr-2 text-accent">Next issue</span>
                    {item.next}
                  </p>
                </Panel>
              </li>
            ))}
          </ol>
          <TurnCorner next={nextOf("on-the-press")?.label} />
        </ComicPage>

        {/* ---- Client websites ------------------------------------------ */}
        <ComicPage id="client-websites" folio={no("client-websites")} labelledBy="clients-title">
          <header className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Caption>Side stories</Caption>
              <h2 id="clients-title" className="mt-5 font-serif text-title">
                <Registration>Client websites</Registration>
              </h2>
            </div>
            <p className="max-w-sm text-fg-muted">Smaller static builds, live on their clients&rsquo; domains.</p>
          </header>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {smallerWork.map((item, i) => (
              <li key={item.name} className="min-w-0">
                <Panel tone={i % 2 ? "blue" : "red"} className="flex h-full flex-col p-6">
                  <p className="label">
                    {item.sector} · {item.year}
                  </p>
                  <p className="mt-3 font-serif text-3xl leading-none">{item.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-fg-muted">{item.description}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                    <p className="font-mono text-xs text-fg-subtle">{item.stack.join(" · ")}</p>
                    {item.live ? (
                      <a href={item.live.href} target="_blank" rel="noopener noreferrer" className="link-underline text-sm text-fg">
                        {item.live.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="text-sm text-fg-subtle">No public link</span>
                    )}
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
          <TurnCorner next={nextOf("client-websites")?.label} />
        </ComicPage>

        {/* ---- Back cover ----------------------------------------------- */}
        <ComicPage id="to-be-continued" folio={no("to-be-continued")} cover labelledBy="end-title">
          <div className="comic-end">
            <span aria-hidden="true" className="speed-lines speed-lines--blue" />
            <Sfx className="comic-end__sfx" tilt={-8}>
              Thwip!
            </Sfx>
            <h2 id="end-title" className="font-serif text-display">
              <Registration>
                To be <em className="text-accent">continued…</em>
              </Registration>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-lg text-fg-muted">
              The next chapter could be yours: a website, an application, or a system that has to hold up.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact">Start the next chapter</ButtonLink>
              <ButtonLink href="/about" variant="outline">
                Meet the author
              </ButtonLink>
            </div>
            <p className="mt-8 text-sm">
              <a href="#cover" className="link-underline text-fg-muted">
                Back to the cover
              </a>
              <span className="text-fg-subtle"> · </span>
              <Link href="/lab" className="link-underline text-fg-muted">
                The Lab
              </Link>
            </p>
            <SpiderBot className="comic-end__bot" says="That's a wrap. Thanks for reading!" />
          </div>
        </ComicPage>
      </ComicReader>
    </div>
  );
}

/** One page of the comic. All but the cover start closed (hidden only when JavaScript runs). */
function ComicPage({
  id,
  folio,
  cover = false,
  labelledBy,
  children,
}: {
  id: string;
  folio: string;
  cover?: boolean;
  labelledBy: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      data-page
      data-inactive={id === "cover" ? undefined : ""}
      className={cn("comic-page", cover && "comic-page--cover")}
    >
      <div className="comic-page__inner">{children}</div>
      <p className="comic-page__folio" aria-hidden="true">
        <span>AMIGODEV Comics</span>
        <span>{folio}</span>
      </p>
    </section>
  );
}

/** The dog-eared corner: turns to the next page (with JavaScript), and says what's on it. */
function TurnCorner({ next }: { next?: string }) {
  if (!next) return null;
  return (
    <button type="button" data-turn="next" className="turn-corner js-only">
      <span className="turn-corner__label">
        <span className="label">Next page</span>
        <span className="turn-corner__name font-serif">{next}</span>
      </span>
      <span aria-hidden="true" className="turn-corner__fold" />
    </button>
  );
}
