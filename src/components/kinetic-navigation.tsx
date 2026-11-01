"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

import { nav, site } from "@/content/site";
import { Wordmark } from "./brand";

const links = [{ href: "/", label: "Home" }, ...nav, { href: "/play", label: "Play DEBUG.EXE" }];

export function KineticNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const hasOpened = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const overlay = root?.querySelector<HTMLElement>(".kn-overlay");
    if (!root || !overlay) return;

    if (!gsap.parseEase("portfolioKinetic")) {
      CustomEase.create("portfolioKinetic", "0.65, 0.01, 0.05, 0.99");
    }

    const panel = root.querySelectorAll<HTMLElement>(".kn-panel");
    const menuLinks = root.querySelectorAll<HTMLElement>(".kn-link");
    const extras = root.querySelectorAll<HTMLElement>("[data-kn-fade]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isOpen) {
      hasOpened.current = true;
      overlay.style.visibility = "visible";
      firstLinkRef.current?.focus({ preventScroll: true });
      if (prefersReducedMotion) {
        gsap.set(panel, { xPercent: 0 });
        gsap.set([menuLinks, extras], { clearProps: "all" });
      } else {
        gsap.fromTo(panel, { xPercent: 105 }, { xPercent: 0, duration: 0.75, stagger: 0.1, ease: "portfolioKinetic", overwrite: true });
        gsap.fromTo(menuLinks, { yPercent: 120, rotate: 7 }, { yPercent: 0, rotate: 0, duration: 0.75, stagger: 0.055, delay: 0.22, ease: "portfolioKinetic", overwrite: true });
        gsap.fromTo(extras, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.06, delay: 0.38, ease: "power2.out", overwrite: true });
      }
    } else if (hasOpened.current) {
      if (prefersReducedMotion) {
        overlay.style.visibility = "hidden";
      } else {
        gsap.to([menuLinks, extras], { autoAlpha: 0, y: -8, duration: 0.18, stagger: 0.01, overwrite: true });
        gsap.to(panel, { xPercent: 105, duration: 0.5, stagger: 0.08, delay: 0.08, ease: "portfolioKinetic", overwrite: true, onComplete: () => { overlay.style.visibility = "hidden"; } });
      }
      triggerRef.current?.focus({ preventScroll: true });
    }

    return () => {
      gsap.killTweensOf([panel, menuLinks, extras]);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) setIsOpen(false);
      if (event.key === "Tab" && isOpen) {
        const focusable = rootRef.current?.querySelectorAll<HTMLElement>(".kn-overlay button, .kn-overlay a[href]");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const animateShape = (index: number, show: boolean) => {
    const shape = rootRef.current?.querySelector<HTMLElement>(`.kn-shape-${(index % 5) + 1}`);
    if (!shape) return;
    rootRef.current?.querySelectorAll(".kn-shape").forEach((item) => item.classList.remove("active"));
    if (show) {
      shape.classList.add("active");
      gsap.fromTo(shape, { scale: 0.72, autoAlpha: 0, rotate: -8 }, { scale: 1, autoAlpha: 0.72, rotate: 0, duration: 0.55, ease: "back.out(1.6)", overwrite: true });
    } else {
      gsap.to(shape, { scale: 0.85, autoAlpha: 0, duration: 0.25, ease: "power2.in", overwrite: true, onComplete: () => shape.classList.remove("active") });
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="kinetic-site-menu"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg transition-colors hover:border-line-strong"
      >
        {isOpen ? "Close" : "Menu"}
        <svg viewBox="0 0 16 16" aria-hidden="true" className={`size-3.5 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
          <path d="M2 5.5h12M2 10.5h12" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <div id="kinetic-site-menu" className="kn-overlay" role="dialog" aria-modal={isOpen} aria-label="Site navigation" aria-hidden={!isOpen}>
        <button type="button" className="kn-scrim" onClick={() => setIsOpen(false)} aria-label="Close navigation" tabIndex={isOpen ? 0 : -1} />
        <div className="kn-panel kn-panel-backdrop" aria-hidden="true" />
        <div className="kn-panel kn-panel-main">
          <div className="kn-topbar">
            <Link href="/" aria-label="Home" onClick={() => setIsOpen(false)}><Wordmark /></Link>
            <button type="button" className="kn-close" onClick={() => setIsOpen(false)}>Close <span aria-hidden="true">×</span></button>
          </div>
          <div className="kn-content">
            <div className="kn-art" aria-hidden="true">
              <span className="kn-shape kn-shape-1" />
              <span className="kn-shape kn-shape-2" />
              <span className="kn-shape kn-shape-3" />
              <span className="kn-shape kn-shape-4" />
              <span className="kn-shape kn-shape-5" />
              <span className="kn-art-grid" />
            </div>
            <nav aria-label="Site menu links" className="relative z-10">
              <ol className="kn-list">
                {links.map((item, index) => {
                  const active = item.href === "/" ? pathname === "/" : item.href.startsWith("/#") ? false : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                  <li key={item.href} className="kn-item" onMouseEnter={() => animateShape(index, true)} onMouseLeave={() => animateShape(index, false)} onFocus={() => animateShape(index, true)} onBlur={() => animateShape(index, false)}>
                    <Link ref={index === 0 ? firstLinkRef : undefined} href={item.href} aria-current={active ? "page" : undefined} className={`kn-link${active ? " kn-link-active" : ""}`} onClick={() => setIsOpen(false)}>
                      <span className="kn-number">{String(index + 1).padStart(2, "0")}</span>
                      <span>{item.label}</span>
                      <span className="kn-arrow" aria-hidden="true">↗</span>
                    </Link>
                  </li>
                  );
                })}
              </ol>
            </nav>
          </div>
          <div className="kn-bottom" data-kn-fade>
            <span>{site.name.toUpperCase()} · {site.brand.toUpperCase()}</span>
            <a href={`mailto:${site.email}`}>Start a conversation ↗</a>
          </div>
        </div>
      </div>
      <style>{`
        .kn-overlay{position:fixed;inset:0;z-index:100;visibility:hidden;color:var(--fg);font-family:var(--font-sans)}
        .kn-scrim{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgb(0 0 0/.72);backdrop-filter:blur(12px);cursor:pointer}
        .kn-panel{position:absolute;inset:0 0 0 auto;width:min(100%,1000px);overflow:hidden}
        .kn-panel-backdrop{background:var(--ink-raised);transform:translateX(105%);border-left:1px solid var(--line-strong)}
        .kn-panel-main{display:flex;flex-direction:column;padding:clamp(1.25rem,4vw,3rem);background:var(--ink);transform:translateX(105%);box-shadow:-30px 0 90px rgb(0 0 0/.4)}
        .kn-topbar,.kn-bottom{position:relative;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:1rem}
        .kn-close{display:flex;align-items:center;gap:.75rem;border:1px solid var(--line-strong);border-radius:999px;padding:.65rem 1rem;color:var(--fg);background:transparent;font:inherit;cursor:pointer}
        .kn-close span{font-size:1.4rem;line-height:.7}
        .kn-content{position:relative;display:flex;flex:1;align-items:center;padding-block:clamp(2rem,7vh,5rem)}
        .kn-art{position:absolute;inset:0;overflow:hidden;pointer-events:none}
        .kn-art-grid{position:absolute;inset:0;opacity:.28;background-image:linear-gradient(to right,var(--grid) 1px,transparent 1px),linear-gradient(to bottom,var(--grid) 1px,transparent 1px);background-size:2.5rem 2.5rem;mask-image:radial-gradient(ellipse at 68% 50%,#000 5%,transparent 70%)}
        .kn-shape{position:absolute;display:block;opacity:0;filter:blur(2px);transition:opacity .2s ease}
        .kn-shape-1{width:30rem;height:30rem;right:8%;top:10%;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgb(242 107 58/.26),transparent 68%);border:1px solid rgb(242 107 58/.18)}
        .kn-shape-2{width:42rem;height:12rem;right:-5%;top:38%;border-radius:50%;border:1px solid rgb(242 107 58/.24);box-shadow:0 0 0 22px rgb(242 107 58/.035),0 0 0 48px rgb(242 107 58/.025);transform:rotate(-18deg)}
        .kn-shape-3{width:26rem;height:26rem;right:20%;top:18%;background-image:radial-gradient(rgb(236 235 230/.4) 1px,transparent 1.5px);background-size:22px 22px;mask-image:radial-gradient(circle,#000 4%,transparent 68%)}
        .kn-shape-4{width:32rem;height:32rem;right:5%;top:12%;border-radius:38% 62% 68% 32% / 42% 38% 62% 58%;background:linear-gradient(140deg,rgb(242 107 58/.16),rgb(236 235 230/.02));border:1px solid rgb(242 107 58/.15)}
        .kn-shape-5{width:38rem;height:38rem;right:4%;top:0;background:repeating-linear-gradient(135deg,transparent 0 26px,rgb(242 107 58/.08) 27px 28px);mask-image:radial-gradient(circle,#000 0%,transparent 70%)}
        .kn-list{position:relative;z-index:2;display:grid;gap:.15rem;margin:0;padding:0;list-style:none}
        .kn-link{display:flex;align-items:baseline;gap:clamp(.8rem,2vw,2rem);width:max-content;max-width:100%;color:var(--fg);font-family:var(--font-serif);font-size:clamp(2.75rem,7vw,6.5rem);line-height:.98;letter-spacing:-.035em;text-decoration:none;transition:color .2s ease}
        .kn-link:hover,.kn-link:focus-visible,.kn-link-active{color:var(--accent)}
        .kn-number{width:2.3rem;flex:none;font-family:var(--font-mono);font-size:.7rem;letter-spacing:.12em;color:var(--fg-subtle)}
        .kn-arrow{font-family:var(--font-sans);font-size:.35em;opacity:0;transform:translate(-8px,8px);transition:opacity .25s ease,transform .25s ease}
        .kn-link:hover .kn-arrow,.kn-link:focus-visible .kn-arrow{opacity:1;transform:translate(0,0)}
        .kn-bottom{padding-top:1.5rem;border-top:1px solid var(--line);font-family:var(--font-mono);font-size:.65rem;letter-spacing:.12em;color:var(--fg-subtle);text-transform:uppercase}
        .kn-bottom a{color:var(--fg);text-decoration:none}
        @media(max-width:640px){.kn-panel-main{padding:1.25rem}.kn-link{font-size:clamp(2.5rem,12vw,4rem)}.kn-number{width:1.6rem}.kn-bottom{align-items:flex-start;flex-direction:column;gap:.6rem}}
        @media(prefers-reduced-motion:reduce){.kn-shape,.kn-link,.kn-arrow{transition:none}}
      `}</style>
    </div>
  );
}
