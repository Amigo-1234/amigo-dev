/*
 * Opens and closes the mobile menu without waiting for React.
 *
 * The menu used to depend on React hydrating the header. On a slow phone the
 * home page's JavaScript keeps the main thread busy for a couple of seconds
 * after first paint, so taps on Menu were delayed or lost until hydration
 * finished. This tiny script is inlined in <head> and uses event delegation,
 * so it works as soon as the HTML is parsed, in the gaps between other work.
 *
 *   [data-menu-open]   opens #site-menu (a native <dialog>, shown modally)
 *   [data-menu-close]  closes it; so does a tap on the dialog's own backdrop
 *                      area, and Escape (native)
 *
 * While open, page scrolling is locked with inline styles on <html>/<body>
 * (no class on <html>, which would invalidate styles for the whole page).
 *
 * Pointer, touch and click events on the Menu button are handled in the
 * window's capture phase and stopped there, before React's listeners on the
 * document see them. If React received a discrete event while the page was
 * still hydrating, it would finish hydrating synchronously inside that tap,
 * which on a slow phone can block the menu for several hundred milliseconds.
 * The button has no React handlers, so React has nothing to miss.
 */
const script = `(function(){var d=document,w=window;function lock(on){var v=on?"hidden":"";d.documentElement.style.overflow=v;if(d.body)d.body.style.overflow=v;var b=d.querySelectorAll("[data-menu-open]");for(var i=0;i<b.length;i++)b[i].setAttribute("aria-expanded",on?"true":"false")}function opener(e){var t=e.target;return t&&t.closest?t.closest("[data-menu-open]"):null}["pointerdown","pointerup","mousedown","mouseup","touchstart","touchend"].forEach(function(n){w.addEventListener(n,function(e){if(opener(e))e.stopPropagation()},{capture:true,passive:true})});w.addEventListener("click",function(e){if(!opener(e))return;e.stopPropagation();var m=d.getElementById("site-menu");if(m&&!m.open){m.showModal();lock(true)}},true);d.addEventListener("click",function(e){var t=e.target;if(!t||!t.closest)return;var m=d.getElementById("site-menu");if(m&&m.open&&(t===m||t.closest("[data-menu-close]")))m.close()});d.addEventListener("close",function(e){if(e.target&&e.target.id==="site-menu")lock(false)},true)})();`;

export function MenuScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
