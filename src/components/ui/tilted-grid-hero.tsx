"use client";

import { cn } from "@/lib/cn";

type TiltedGridImage = { src: string; alt: string };

type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  children?: React.ReactNode;
  className?: string;
};

/** A continuous, perspective tilted image rail for hero artwork. */
export function TiltedGridHero({ images, children, className }: TiltedGridHeroProps) {
  const tiles = [...images, ...images];

  return (
    <section
      aria-label="A moving gallery of selected visual work"
      className={cn("relative isolate overflow-hidden [perspective:1100px]", className)}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--ink)_100%)] opacity-70" />
      <div className="absolute inset-[-12%_-30%] flex items-center [transform:rotateX(13deg)_rotateZ(-7deg)]">
        <div className="tilted-grid-track flex w-max items-center gap-3 px-3 sm:gap-5">
          {tiles.map((image, index) => (
            <div
              aria-hidden={index >= images.length}
              className="relative h-[16rem] w-[11rem] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-ink-raised shadow-2xl sm:h-[21rem] sm:w-[14rem]"
              key={`${image.src}-${index}`}
              style={{ transform: `translateY(${index % 2 === 0 ? "-1.25rem" : "1.25rem"}) rotateY(${index % 2 === 0 ? "-8deg" : "8deg"})` }}
            >
              {/* Remote art is served by the 21st component CDN; a plain img avoids a host-specific Next config change. */}
              <img src={image.src} alt={image.alt} className="size-full object-cover opacity-85 transition duration-700 hover:scale-105 hover:opacity-100" loading="lazy" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-white/5" />
            </div>
          ))}
        </div>
      </div>
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
      <style>{`
        @keyframes tilted-grid-drift { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tilted-grid-track { animation: tilted-grid-drift 42s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .tilted-grid-track { animation: none; } }
      `}</style>
    </section>
  );
}
