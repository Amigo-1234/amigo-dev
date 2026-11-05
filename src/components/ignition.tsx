import { MONOGRAM_BAR, MONOGRAM_INK } from "@/components/brand";
import { gearGeometry, gearPath } from "@/lib/engineering/gears";

/*
 * Ignition: the homepage's opening. A 24-tooth gear meshes with a 12-tooth
 * pinion on the blueprint. Tap the gear and the engine spools up (speed, rev
 * counter, vibration, motion blur), then both gears roll off the sheet at
 * true rolling speed, the sheet opens like a pair of valves and the site rises
 * into place.
 *
 * It must answer the very first tap, long before React has hydrated a heavy
 * page on a slow phone, so it is plain JavaScript inlined in the HTML (the same
 * approach as MenuScript). All live state goes on <html> attributes and CSS
 * variables on the overlay; React's own markup is never rewritten, so
 * hydration is unaffected.
 *
 *   IgnitionGate  in <head>: decides before first paint whether to run
 *   Ignition      the overlay and its controller, in the root layout (outside
 *                 the page-transition wrapper, whose transform would otherwise
 *                 trap position: fixed); hidden unless the gate switched it on
 *
 * It runs once per tab session, and is skipped for reduced motion, search
 * crawlers and automated browsers (add ?ignition to force it).
 */

const STORAGE = "amigodev-ignition";

const gate = `(function(){try{var h=document.documentElement;if(location.pathname!=="/")return;var force=/[?&]ignition\\b/.test(location.search);var seen=false;try{seen=sessionStorage.getItem("${STORAGE}")==="done"}catch(e){}var ua=navigator.userAgent||"";if(!force&&(seen||navigator.webdriver||/bot|crawl|spider|slurp|preview|facebookexternalhit|lighthouse/i.test(ua)||matchMedia("(prefers-reduced-motion: reduce)").matches))return;h.setAttribute("data-ignition","idle");h.style.overflow="hidden"}catch(e){}})();`;

export function IgnitionGate() {
  return <script dangerouslySetInnerHTML={{ __html: gate }} />;
}

// Geometry, in SVG units: module 10, so the gear's pitch radius is 120 and the pinion's 60.
const N1 = 24;
const N2 = 12;
const M = 10;
const BETA = 0.62; // direction from the gear's centre to the pinion's
const g1 = gearGeometry(N1, M);
const g2 = gearGeometry(N2, M);
const A = (M * (N1 + N2)) / 2;
const P2 = { x: A * Math.cos(BETA), y: A * Math.sin(BETA) };

const controller = `(function(){
var d=document,h=d.documentElement,o=d.getElementById("ignition");
if(!o||h.getAttribute("data-ignition")!=="idle")return;
var N1=${N1},N2=${N2},B=${BETA},R1=${g1.pitchRadius},R2=${g2.pitchRadius},TIP=${g1.tipRadius},WMAX=26,SPOOL=1150,LAUNCH=1000;
var btn=o.querySelector("[data-ign-start]"),skip=o.querySelector("[data-ign-skip]"),rpm=o.querySelector(".ign-rpm");
var th=0,w=0.5,state="idle",t0=0,tl=0,last=0,raf=0,x1=0,x2=0,v1=0,v2=0,thl=0,tpl=0,inerted=[];
var mesh=function(a){return B+Math.PI-Math.PI/N2-(N1/N2)*(a-B)};
var set=function(k,v){o.style.setProperty(k,v)};
var rad=function(a){return a.toFixed(4)+"rad"};
var lock=function(on){var kids=[].slice.call(d.body.children);var main=d.getElementById("main");if(main)kids=kids.concat([].slice.call(main.children));kids.forEach(function(el){if(el===o||el===main||el.contains(o)||el.tagName==="SCRIPT")return;if(on){if(!el.inert){el.inert=true;inerted.push(el)}}});if(!on){inerted.forEach(function(el){el.inert=false});inerted=[]}};
function draw(){
 var tp=state==="launch"?tpl+(x2/R2):mesh(th);
 set("--ign-a1",rad(th));set("--ign-x1",x1.toFixed(2)+"px");
 set("--ign-a2",rad(tp));set("--ign-x2",(${P2.x.toFixed(3)}+x2).toFixed(2)+"px");set("--ign-y2","${P2.y.toFixed(3)}px");
}
function frame(t){
 var dt=last?Math.min(0.05,(t-last)/1000):0;last=t;
 if(state==="spool"){
  var p=Math.min(1,(t-t0)/SPOOL),e=p*p*(3-2*p);
  w=0.5+(WMAX-0.5)*p*p;
  var amp=3.2*e*e;set("--ign-sx",((Math.random()-.5)*amp).toFixed(2)+"px");set("--ign-sy",((Math.random()-.5)*amp).toFixed(2)+"px");
  set("--ign-p",e.toFixed(3));
  var r=Math.round(e*3200+(p>.6?Math.random()*60:0));rpm&&rpm.setAttribute("data-rpm",("0000"+r).slice(-4));
  th+=w*dt;
  if(p>=1){state="launch";tl=t;thl=th;tpl=mesh(th);v1=900;v2=-760;h.setAttribute("data-ignition","launch");set("--ign-sx","0px");set("--ign-sy","0px")}
 }else if(state==="launch"){
  // Wheelspin, then grip: once on the ground each gear rolls without slipping (turn = distance / radius).
  v1+=700*dt;v2-=600*dt;x1+=v1*dt;x2+=v2*dt;th=thl+x1/R1;
  if(t-tl>LAUNCH){finish();return}
 }else{th+=w*dt}
 draw();raf=requestAnimationFrame(frame);
}
function start(){
 if(state!=="idle")return;state="spool";t0=performance.now();h.setAttribute("data-ignition","spool");
 try{navigator.vibrate&&navigator.vibrate([10,60,14,40,20])}catch(e){}
}
function finish(){
 cancelAnimationFrame(raf);state="done";lock(false);
 h.setAttribute("data-ignition","off");h.setAttribute("data-ignited","");h.style.overflow="";
 try{sessionStorage.setItem("${STORAGE}","done")}catch(e){}
 var m=d.getElementById("main");if(m)m.focus({preventScroll:true});
 setTimeout(function(){h.removeAttribute("data-ignited")},1200);
 d.removeEventListener("keydown",key,true);
}
function key(e){if(e.key==="Escape"){e.preventDefault();finish()}}
btn&&btn.addEventListener("click",start);
skip&&skip.addEventListener("click",finish);
d.addEventListener("keydown",key,true);
lock(true);draw();raf=requestAnimationFrame(frame);
// This runs before the rest of the page is parsed: lock it again once it all exists.
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",function(){if(state!=="done")lock(true)});
try{btn&&btn.focus({preventScroll:true})}catch(e){}
})();`;

export function Ignition() {
  const hub = 46;
  return (
    <div
      id="ignition"
      className="ign"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ign-title"
      aria-describedby="ign-desc"
    >
      <div aria-hidden="true" className="ign-panel ign-panel--top" />
      <div aria-hidden="true" className="ign-panel ign-panel--bottom" />

      <div className="ign-bar">
        <p className="ign-mark">
          <svg viewBox="0 0 48 48" aria-hidden="true" className="ign-mono">
            <path d={MONOGRAM_INK} fill="currentColor" fillRule="evenodd" />
            <path d={MONOGRAM_BAR} fill="var(--accent)" />
          </svg>
          AMIGODEV · Engine 01
        </p>
        <button type="button" data-ign-skip className="ign-skip">
          Skip intro <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="ign-stage">
        <div className="ign-rig">
          <button type="button" data-ign-start className="ign-start" aria-label="Start the engine and open the site">
            <svg viewBox="-150 -150 300 300" aria-hidden="true" className="ign-svg">
              <defs>
                <pattern id="ign-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="7" stroke="var(--hatch)" strokeWidth="1.4" />
                </pattern>
              </defs>
              {/* Pitch circles and the line of centres: the construction layer. */}
              <g className="ign-construction">
                <circle r={g1.pitchRadius} />
                <circle cx={P2.x} cy={P2.y} r={g2.pitchRadius} />
                <line x1={-g1.tipRadius - 18} y1="0" x2={g1.tipRadius + 18} y2="0" />
                <line x1="0" y1={-g1.tipRadius - 18} x2="0" y2={g1.tipRadius + 18} />
              </g>
              {/* Pinion */}
              <g className="ign-g2">
                <path d={gearPath(g2, 7)} className="ign-tooth" />
                <circle r="20" className="ign-hub" />
                <circle r="8" className="ign-bore" />
              </g>
              {/* Motion blur: a coarse ghost of the outline (it is blurred anyway) trailing behind at speed. */}
              <g className="ign-ghost">
                <path d={gearPath(g1, 3)} />
              </g>
              {/* The gear */}
              <g className="ign-g1">
                <path d={gearPath(g1, 7)} className="ign-tooth" />
                <circle r={(g1.rootRadius - 14 + hub) / 2} fill="none" stroke="url(#ign-hatch)" strokeWidth={g1.rootRadius - 14 - hub} />
                <circle r={g1.rootRadius - 14} className="ign-rim" />
                <circle r={hub} className="ign-hub" />
                <g transform="translate(-24 -24)">
                  <path d={MONOGRAM_INK} fill="currentColor" fillRule="evenodd" />
                  <path d={MONOGRAM_BAR} fill="var(--accent)" />
                </g>
                <circle cx={g1.rootRadius - 7} cy="0" r="4.5" fill="var(--accent)" />
              </g>
            </svg>
            <span className="ign-pulse" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="ign-foot">
        <div className="ign-gauge" aria-hidden="true">
          <span className="ign-rpm" data-rpm="0000" />
          <span className="ign-unit">RPM</span>
          <span className="ign-track">
            <span className="ign-fill" />
          </span>
        </div>
        <h2 id="ign-title" className="ign-title">
          Tap the gear to start the engine
        </h2>
        <p id="ign-desc" className="ign-desc">
          Muftau Idris · Full-stack developer &amp; Mechanical Engineering student. Press Escape to skip.
        </p>
      </div>
      <script dangerouslySetInnerHTML={{ __html: controller }} />
    </div>
  );
}
