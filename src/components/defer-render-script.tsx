/*
 * Below-the-fold sections use `content-visibility: auto` (.defer-render), so
 * until they are rendered the browser only knows their estimated height. That
 * is fine for scrolling, but a jump to an anchor (/#services) would land in
 * the wrong place. Before any hash jump, html.render-all renders every section
 * so positions are real. The cost is paid once, and only by visitors who jump.
 *
 * Runs inline in <head>: covers a page opened with a hash and clicks on hash
 * links. Code that navigates programmatically calls renderAll() first.
 */
const script = `(function(){var d=document;function all(){d.documentElement.classList.add("render-all")}if(location.hash.length>1)all();d.addEventListener("click",function(e){var t=e.target;if(t&&t.closest&&t.closest("a[href*='#']"))all()},true);addEventListener("hashchange",all)})();`;

export function DeferRenderScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function renderAll(href: string) {
  if (href.includes("#")) document.documentElement.classList.add("render-all");
}
