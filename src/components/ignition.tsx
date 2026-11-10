import { MONOGRAM_BAR, MONOGRAM_INK } from "@/components/brand";
import { gearGeometry, gearPath } from "@/lib/engineering/gears";
import { compactPath } from "@/lib/svg";

/*
 * Ignition: the homepage's opening, the cover of Issue #01. A 24-tooth gear
 * meshes with a 12-tooth pinion as the cover art, under the title and two
 * choices: enter with sound or without (sound is never on unless chosen).
 * Either one (or the gear itself) starts the engine: it spools up (speed,
 * rev counter, vibration, motion blur), both gears roll off at true rolling
 * speed, the cover opens like a pair of valves and the site rises into place.
 *
 * It must answer the very first tap, long before React has hydrated a heavy
 * page on a slow phone, so it is plain JavaScript inlined in the HTML (the same
 * approach as MenuScript). All live state goes on <html> attributes and CSS
 * variables on the overlay (which React is told to leave alone). The rest of
 * the page is never touched: focus is held inside the cover by a trap in this
 * script rather than by marking React's elements inert, so hydration matches.
 *
 *   IgnitionGate  in <head>: decides before first paint whether to run
 *   Ignition      the overlay and its controller, in the root layout (outside
 *                 the page-transition wrapper, whose transform would otherwise
 *                 trap position: fixed); hidden unless the gate switched it on
 *
 * It runs once per visit: each new tab or browser session opens on the cover,
 * and moving around the site afterwards never brings it back (sessionStorage).
 * It is skipped for reduced motion, search crawlers and automated browsers
 * (add ?ignition to force it). The sound choice is stored
 * and the AudioContext is unlocked inside the click itself, so the score can
 * start even before React has loaded; lib/sound.ts takes it from there.
 */

const STORAGE = "amigodev-ignition";
const SOUND = "amigodev-sound";

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
var btn=o.querySelector("[data-ign-start]"),skip=o.querySelector("[data-ign-skip]"),rpm=o.querySelector(".ign-rpm"),choices=o.querySelectorAll("[data-ign-sound]");
var emit=function(n){try{window.dispatchEvent(new CustomEvent("amigodev:ignition",{detail:n}))}catch(e){}};
var th=0,w=0.5,state="idle",t0=0,tl=0,last=0,raf=0,x1=0,x2=0,v1=0,v2=0,thl=0,tpl=0;
var mesh=function(a){return B+Math.PI-Math.PI/N2-(N1/N2)*(a-B)};
var set=function(k,v){o.style.setProperty(k,v)};
var rad=function(a){return a.toFixed(4)+"rad"};
// Keep focus on the cover while it is up (Tab cycles through its buttons; focus that lands outside comes back).
var focusables=function(){return [].slice.call(o.querySelectorAll("button")).filter(function(b){return b.offsetParent!==null})};
var trapTab=function(e){if(e.key!=="Tab")return;var f=focusables();if(!f.length)return;var i=f.indexOf(d.activeElement),n=e.shiftKey?(i<=0?f.length-1:i-1):(i<0||i===f.length-1?0:i+1);e.preventDefault();f[n].focus()};
var trapIn=function(e){if(state!=="done"&&!o.contains(e.target)){var f=focusables();f[0]&&f[0].focus({preventScroll:true})}};
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
  if(p>=1){state="launch";tl=t;thl=th;tpl=mesh(th);v1=900;v2=-760;h.setAttribute("data-ignition","launch");set("--ign-sx","0px");set("--ign-sy","0px");emit("launch")}
 }else if(state==="launch"){
  // Wheelspin, then grip: once on the ground each gear rolls without slipping (turn = distance / radius).
  v1+=700*dt;v2-=600*dt;x1+=v1*dt;x2+=v2*dt;th=thl+x1/R1;
  if(t-tl>LAUNCH){finish();return}
 }else{th+=w*dt}
 draw();raf=requestAnimationFrame(frame);
}
function start(){
 if(state!=="idle")return;state="spool";t0=performance.now();h.setAttribute("data-ignition","spool");emit("spool");
 try{navigator.vibrate&&navigator.vibrate([10,60,14,40,20])}catch(e){}
}
function finish(){
 cancelAnimationFrame(raf);state="done";d.removeEventListener("keydown",trapTab,true);d.removeEventListener("focusin",trapIn,true);
 h.setAttribute("data-ignition","off");h.setAttribute("data-ignited","");h.style.overflow="";
 try{sessionStorage.setItem("${STORAGE}","done")}catch(e){}
 var m=d.getElementById("main");if(m)m.focus({preventScroll:true});
 setTimeout(function(){h.removeAttribute("data-ignited")},1200);
 d.removeEventListener("keydown",key,true);
}
function key(e){if(e.key==="Escape"){e.preventDefault();finish()}}
// The choice is made inside the click, so the browser lets audio start: store it, unlock audio if wanted, then start.
function choose(on){
 try{localStorage.setItem("${SOUND}",on?"on":"off")}catch(e){}
 if(on){try{var AC=window.AudioContext||window.webkitAudioContext;var c=window.__amigoAudio||new AC();window.__amigoAudio=c;if(c.resume)c.resume()}catch(e){}}
 try{window.dispatchEvent(new Event("amigodev:sound"))}catch(e){}
 start();
}
[].forEach.call(choices,function(b){b.addEventListener("click",function(){choose(b.getAttribute("data-ign-sound")==="on")})});
btn&&btn.addEventListener("click",start);
skip&&skip.addEventListener("click",finish);
d.addEventListener("keydown",key,true);
d.addEventListener("keydown",trapTab,true);d.addEventListener("focusin",trapIn,true);
draw();raf=requestAnimationFrame(frame);
try{(choices[0]||btn).focus({preventScroll:true})}catch(e){}
})();`;

export function Ignition() {
  const hub = 46;
  return (
    <div
      id="ignition"
      className="ign"
      // Its controller sets the gears' CSS variables before React hydrates.
      suppressHydrationWarning
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
          AMIGODEV · Issue #01
        </p>
        <button type="button" data-ign-skip className="ign-skip">
          Skip intro <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className="ign-stage">
        <div className="ign-rig">
          <button type="button" data-ign-start className="ign-start" aria-label="Start the engine and open the site, keeping your sound setting">
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
                <path d={compactPath(gearPath(g2, 4))} className="ign-tooth" />
                <circle r="20" className="ign-hub" />
                <circle r="8" className="ign-bore" />
              </g>
              {/* Motion blur: a coarse ghost of the outline (it is blurred anyway) trailing behind at speed. */}
              <g className="ign-ghost">
                <path d={compactPath(gearPath(g1, 2))} />
              </g>
              {/* The gear */}
              <g className="ign-g1">
                <path d={compactPath(gearPath(g1, 5))} className="ign-tooth" />
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
        <div className="ign-cover">
          <p className="ign-kicker">Written, drawn &amp; built by Muftau Idris</p>
          <h2 id="ign-title" className="ign-title reg">
            The engineer behind the mask
          </h2>
          <div className="ign-choices">
            <button type="button" data-ign-sound="on" className="ign-choice ign-choice--primary">
              Enter with sound
            </button>
            <button type="button" data-ign-sound="off" className="ign-choice">
              Enter without sound
            </button>
          </div>
          <p id="ign-desc" className="ign-desc">
            Full-stack developer &amp; Mechanical Engineering student. Sound stays off unless you choose it; M mutes at any
            time. Press Escape to skip.
          </p>
        </div>
        <div className="ign-gauge" aria-hidden="true">
          <span className="ign-rpm" data-rpm="0000" />
          <span className="ign-unit">RPM</span>
          <span className="ign-track">
            <span className="ign-fill" />
          </span>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: controller }} />
    </div>
  );
}
