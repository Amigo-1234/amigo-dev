import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";

/*
 * The background of every page: one fixed layer behind the content, in four
 * plates that match the identity.
 *
 *   grid        a faint drafting grid (fine squares, a heavier line every fifth)
 *   halftone    Ben-Day dots fading in from two corners, red and blueprint blue
 *   web         the corners of two orb webs, anchored at opposite corners
 *   drawing     blueprint annotations in the margins: a gear with its centre
 *               marks and diameter, a dimension line, a section hatch, sheet
 *               notes, registration crosshairs, and construction lines that
 *               draw themselves across the sheet as you scroll down the page
 *
 * It is plain SVG and CSS. A few lines of inline script (below) keep one CSS
 * variable, --sp, at the page's scroll progress: the gear turns with it, the
 * webs drift a little, the construction lines draw. Reduced motion leaves it
 * still. Everything is aria-hidden and sits under the content, which keeps
 * its own backgrounds, so text never sits on anything busy.
 */

const gear = gearGeometry(28, 9);

// Spokes and spiral rings of a web anchored at the origin, opening into the quadrant (+x, +y).
const WEB_SPOKES = Array.from({ length: 7 }, (_, i) => (i / 6) * (Math.PI / 2));
const WEB_RINGS = [70, 130, 200, 280, 370, 470];
function webCorner() {
  const spokes = WEB_SPOKES.map((a) => `M0 0L${(Math.cos(a) * 560).toFixed(1)} ${(Math.sin(a) * 560).toFixed(1)}`).join("");
  const rings = WEB_RINGS.map((r) => {
    const pts = WEB_SPOKES.map((a) => [Math.cos(a) * r, Math.sin(a) * r]);
    return pts
      .map(([x, y], i) => {
        if (i === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
        const [px, py] = pts[i - 1];
        // Each strand sags a little toward the hub.
        const mx = ((px + x) / 2) * 0.94;
        const my = ((py + y) / 2) * 0.94;
        return `Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join("");
  }).join("");
  return spokes + rings;
}
const WEB = webCorner();

const script = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var h=document.documentElement,q=0;function set(){q=0;var m=h.scrollHeight-innerHeight;h.style.setProperty("--sp",(m>0?Math.min(1,Math.max(0,scrollY/m)):0).toFixed(4))}addEventListener("scroll",function(){if(!q)q=requestAnimationFrame(set)},{passive:true});addEventListener("resize",set);set()}catch(e){}})();`;

export function SiteBackdrop() {
  return (
    <div aria-hidden="true" className="backdrop">
      <div className="backdrop__grid" />
      <div className="backdrop__dots backdrop__dots--red" />
      <div className="backdrop__dots backdrop__dots--blue" />
      <svg className="backdrop__web backdrop__web--tl" viewBox="0 0 560 560">
        <path d={WEB} />
      </svg>
      <svg className="backdrop__web backdrop__web--br" viewBox="0 0 560 560">
        <path d={WEB} />
      </svg>

      <svg className="backdrop__sheet" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {/* Construction lines: they draw across the sheet as you read down the page. */}
        <path className="bd-construct" pathLength={1} d="M-20 268 H1460" />
        <path className="bd-construct bd-construct--late" pathLength={1} d="M-20 905 L1460 -5" />
        <path className="bd-construct bd-construct--blue" pathLength={1} d="M1312 -10 V910" />

        {/* A gear in the right margin, with centre marks and its diameter; it turns as you scroll. */}
        <g className="bd-gear-wrap" transform="translate(1385 640)">
          <path className="bd-centre" d="M-150 0H150M0 -150V150" />
          <g className="bd-gear">
            <path d={compactPath(gearPath(gear, 3))} />
            <circle r={gear.rootRadius - 22} />
            <circle r="18" />
          </g>
          <text className="bd-note" x="-140" y="-138">
            Ø {Math.round(gear.tipRadius * 2)} · 28T · m9
          </text>
        </g>

        {/* A vertical dimension in the left margin. */}
        <g className="bd-dim" transform="translate(44 180)">
          <path d="M0 0V420M-8 0H8M-8 420H8M0 0l-4 12h8zM0 420l-4-12h8z" />
          <text className="bd-note" transform="translate(-10 250) rotate(-90)">
            SHEET 01 · SCALE 1:1
          </text>
        </g>

        {/* A section hatch in the bottom-left margin. */}
        <g transform="translate(14 700)">
          <rect className="bd-hatch-box" width="44" height="120" />
          <path className="bd-hatch" d="M0 30L30 0M0 60L44 16M0 90L44 46M0 120L44 76M14 120L44 90M44 106L30 120" />
        </g>

        {/* Registration crosshairs, as on a printed sheet. */}
        <g className="bd-reg">
          <g transform="translate(30 60)">
            <circle r="9" />
            <path d="M-15 0H15M0 -15V15" />
          </g>
          <g transform="translate(1410 852)">
            <circle r="9" />
            <path d="M-15 0H15M0 -15V15" />
          </g>
        </g>
      </svg>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}
