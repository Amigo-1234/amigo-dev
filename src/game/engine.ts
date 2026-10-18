import { buildSprites, PALETTE, type Sprite } from "./sprites";

/*
 * DEBUG.EXE — defend the production server from incoming bugs.
 *
 * Plain TypeScript and a 2D canvas, no game engine. The world is a fixed
 * 240×320 grid of logical pixels; the canvas is scaled to fit the screen.
 */

export const W = 240;
export const H = 320;
const SERVER_TOP = H - 34;
const PLAYER_Y = SERVER_TOP - 21;
const PLAYER_SPEED = 135;

type BugKind = "beetle" | "spider" | "leak" | "drop" | "heisen";

type Bug = {
  kind: BugKind;
  x: number;
  y: number;
  baseX: number;
  vy: number;
  hp: number;
  t: number;
  phase: number;
  hit: number;
};

type Box = { x: number; y: number; w: number; h: number };
type Shot = { x: number; y: number };
type Pickup = { kind: "coffee" | "hotfix"; x: number; y: number; t: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };
type Toast = { text: string; life: number; max: number; color: string };

const BUGS: Record<BugKind, { hp: number; speed: number; points: number; damage: number; color: string }> = {
  beetle: { hp: 1, speed: 24, points: 10, damage: 10, color: PALETTE.r },
  spider: { hp: 1, speed: 32, points: 20, damage: 8, color: PALETTE.p },
  leak: { hp: 3, speed: 15, points: 30, damage: 16, color: PALETTE.G },
  drop: { hp: 1, speed: 40, points: 5, damage: 5, color: PALETTE.G },
  heisen: { hp: 2, speed: 26, points: 40, damage: 12, color: PALETTE.c },
};

export type Input = { left: boolean; right: boolean; fire: boolean; targetX: number | null };

export type GameEvents = {
  onGameOver: (score: number) => void;
  onAnnounce: (text: string) => void;
};

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const rand = (min: number, max: number) => min + Math.random() * (max - min);
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class Game {
  readonly input: Input = { left: false, right: false, fire: false, targetX: null };
  score = 0;
  integrity = 100;
  level = 1;
  over = false;

  private sprites = buildSprites();
  private kills = 0;
  private time = 0;
  private spawnIn = 1;
  private cooldown = 0;
  private coffee = 0;
  private px = W / 2;
  private bugs: Bug[] = [];
  private shots: Shot[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private toasts: Toast[] = [];
  private shake = 0;
  private serverFlash = 0;
  private onFire = false;
  private sawHeisen = false;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private events: GameEvents,
    private options: { reducedMotion: boolean; best: number; font: string },
  ) {}

  set best(value: number) {
    this.options.best = value;
  }

  reset() {
    Object.assign(this.input, { left: false, right: false, fire: false, targetX: null });
    this.score = 0;
    this.integrity = 100;
    this.level = 1;
    this.over = false;
    this.kills = 0;
    this.time = 0;
    this.spawnIn = 0.8;
    this.cooldown = 0;
    this.coffee = 0;
    this.px = W / 2;
    this.bugs = [];
    this.shots = [];
    this.pickups = [];
    this.particles = [];
    this.toasts = [];
    this.shake = 0;
    this.serverFlash = 0;
    this.onFire = false;
    this.sawHeisen = false;
    this.toast("git push origin main", PALETTE.w);
  }

  // ---------------------------------------------------------------- update

  update(dt: number) {
    if (this.over) return;
    this.time += dt;
    this.cooldown -= dt;
    this.coffee = Math.max(0, this.coffee - dt);
    this.shake = Math.max(0, this.shake - dt);
    this.serverFlash = Math.max(0, this.serverFlash - dt);

    this.movePlayer(dt);
    this.fire();
    this.spawn(dt);

    for (const s of this.shots) s.y -= 230 * dt;
    this.shots = this.shots.filter((s) => s.y > -10);

    for (const b of this.bugs) this.moveBug(b, dt);
    for (const p of this.pickups) {
      p.t += dt;
      p.y += 38 * dt;
    }

    this.collide();

    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 90 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const t of this.toasts) t.life -= dt;
    this.toasts = this.toasts.filter((t) => t.life > 0);
  }

  private movePlayer(dt: number) {
    const { left, right, targetX } = this.input;
    if (targetX !== null) {
      const delta = targetX - this.px;
      const step = PLAYER_SPEED * 1.35 * dt;
      this.px += Math.abs(delta) <= step ? delta : Math.sign(delta) * step;
    } else {
      this.px += ((right ? 1 : 0) - (left ? 1 : 0)) * PLAYER_SPEED * dt;
    }
    const half = this.sprites.player.w / 2;
    this.px = Math.min(W - half - 2, Math.max(half + 2, this.px));
  }

  private fire() {
    if (!this.input.fire || this.cooldown > 0) return;
    this.cooldown = this.coffee > 0 ? 0.1 : 0.22;
    this.shots.push({ x: Math.round(this.px) - 1, y: PLAYER_Y - 6 });
  }

  private spawn(dt: number) {
    this.spawnIn -= dt;
    if (this.spawnIn > 0) return;
    const interval = Math.max(0.36, 1.2 - (this.level - 1) * 0.1);
    this.spawnIn = interval * rand(0.7, 1.3);

    const kinds: BugKind[] =
      this.level === 1
        ? ["beetle"]
        : this.level === 2
          ? ["beetle", "beetle", "spider"]
          : this.level < 5
            ? ["beetle", "beetle", "spider", "spider", "leak", "heisen"]
            : ["beetle", "spider", "spider", "leak", "leak", "heisen", "heisen"];
    const kind = pick(kinds);
    const sprite = this.spriteFor(kind);
    const x = rand(sprite.w / 2 + 24, W - sprite.w / 2 - 24);
    this.bugs.push(this.makeBug(kind, x, -sprite.h));

    if (kind === "heisen" && !this.sawHeisen) {
      this.sawHeisen = true;
      this.toast("Unexpected feature detected.", PALETTE.c);
    }
  }

  private makeBug(kind: BugKind, x: number, y: number): Bug {
    const speed = BUGS[kind].speed * (1 + (this.level - 1) * 0.09) * rand(0.9, 1.15);
    return { kind, x, y, baseX: x, vy: speed, hp: BUGS[kind].hp, t: 0, phase: rand(0, Math.PI * 2), hit: 0 };
  }

  private moveBug(b: Bug, dt: number) {
    b.t += dt;
    b.hit = Math.max(0, b.hit - dt);
    b.y += b.vy * dt;
    if (b.kind === "spider") b.x = b.baseX + Math.sin(b.t * 3.2 + b.phase) * 22;
    else if (b.kind === "beetle") b.x = b.baseX + Math.sin(b.t * 2 + b.phase) * 3;
    const half = this.spriteFor(b.kind).w / 2;
    b.x = Math.min(W - half, Math.max(half, b.x));
  }

  /** Heisenbugs are only there some of the time — and can only be hit then. */
  private visible(b: Bug) {
    return b.kind !== "heisen" || Math.sin(b.t * 2.6 + b.phase) > -0.25;
  }

  private spriteFor(kind: BugKind): Sprite {
    return this.sprites[kind === "drop" ? "drop" : kind];
  }

  private box(b: Bug): Box {
    const s = this.spriteFor(b.kind);
    return { x: b.x - s.w / 2, y: b.y, w: s.w, h: s.h };
  }

  private collide() {
    const survivors: Bug[] = [];
    const spawned: Bug[] = [];

    for (const b of this.bugs) {
      const box = this.box(b);
      let dead = false;

      if (this.visible(b)) {
        for (const s of this.shots) {
          if (s.y < -5 || !overlap(box, { x: s.x, y: s.y, w: 2, h: 8 })) continue;
          s.y = -20; // consumed
          b.hp -= 1;
          b.hit = 0.08;
          if (b.hp <= 0) {
            dead = true;
            this.killed(b, box, spawned);
            break;
          }
        }
      }

      if (!dead && box.y + box.h >= SERVER_TOP) {
        dead = true;
        this.breach(b, box);
      }
      if (!dead) survivors.push(b);
    }
    this.bugs = survivors.concat(spawned);
    this.shots = this.shots.filter((s) => s.y > -10);

    const player: Box = { x: this.px - 13, y: PLAYER_Y - 2, w: 26, h: 20 };
    this.pickups = this.pickups.filter((p) => {
      if (overlap(player, { x: p.x - 7, y: p.y, w: 14, h: 14 })) {
        if (p.kind === "coffee") {
          this.coffee = 6;
          this.toast("Coffee: rapid fire", PALETTE.y);
        } else {
          this.integrity = Math.min(100, this.integrity + 20);
          if (this.integrity >= 40) this.onFire = false;
          this.toast("Hotfix applied", PALETTE.G);
        }
        return false;
      }
      return p.y < SERVER_TOP;
    });
  }

  private killed(b: Bug, box: Box, spawned: Bug[]) {
    const cfg = BUGS[b.kind];
    this.score += cfg.points * this.level;
    this.burst(box.x + box.w / 2, box.y + box.h / 2, cfg.color, 14);

    if (b.kind === "leak") {
      spawned.push(this.makeBug("drop", b.x - 9, b.y + 4), this.makeBug("drop", b.x + 9, b.y + 4));
    }
    if (b.kind !== "drop") {
      this.kills += 1;
      if (Math.random() < 0.08) this.pickups.push({ kind: Math.random() < 0.5 ? "coffee" : "hotfix", x: b.x, y: b.y, t: 0 });
      if (this.kills % 9 === 0) this.toast(pick(["Bug fixed.", "Bug fixed.", "Closed: fixed in prod.", "Ticket resolved."]), PALETTE.O);
      if (this.kills % 20 === 0) this.levelUp();
    }
  }

  private breach(b: Bug, box: Box) {
    this.integrity = Math.max(0, this.integrity - BUGS[b.kind].damage);
    this.serverFlash = 0.25;
    if (!this.options.reducedMotion) this.shake = 0.25;
    this.burst(box.x + box.w / 2, SERVER_TOP, PALETTE.r, 10);

    if (this.integrity <= 0) {
      this.over = true;
      this.toast("Production is down.", PALETTE.r);
      this.events.onGameOver(this.score);
      return;
    }
    if (this.integrity < 30 && !this.onFire) {
      this.onFire = true;
      this.toast("Production is on fire.", PALETTE.r);
      this.events.onAnnounce(`Warning: server integrity ${this.integrity} percent`);
    } else if (Math.random() < 0.3) {
      this.toast("Works on my machine.", PALETTE.w);
    }
  }

  private levelUp() {
    this.level += 1;
    this.score += 50 * this.level;
    this.toast(`Deploy successful. Sprint ${this.level}`, PALETTE.G);
    this.events.onAnnounce(`Deploy successful. Sprint ${this.level}.`);
  }

  private burst(x: number, y: number, color: string, count: number) {
    const n = this.options.reducedMotion ? Math.ceil(count / 3) : count;
    for (let i = 0; i < n && this.particles.length < 260; i++) {
      const a = rand(0, Math.PI * 2);
      const v = rand(20, 70);
      const max = rand(0.3, 0.7);
      this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, life: max, max, color });
    }
  }

  private toast(text: string, color: string) {
    this.toasts = [{ text, color, life: 1.8, max: 1.8 }, ...this.toasts].slice(0, 2);
  }

  // ------------------------------------------------------------------ draw

  draw() {
    const { ctx } = this;
    const k = ctx.canvas.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = "#0b0b0c";
    ctx.fillRect(0, 0, W, H);
    this.drawBackdrop();

    ctx.save();
    if (this.shake > 0) ctx.translate(rand(-2, 2) * (this.shake / 0.25), rand(-2, 2) * (this.shake / 0.25));

    this.drawServer();

    for (const p of this.pickups) {
      const s = this.sprites[p.kind];
      ctx.drawImage(s.frames[0], Math.round(p.x - s.w / 2), Math.round(p.y + Math.sin(p.t * 6) * 1.5), s.w, s.h);
    }

    const patch = this.sprites.patch;
    for (const s of this.shots) ctx.drawImage(patch.frames[0], Math.round(s.x), Math.round(s.y), patch.w, patch.h);

    for (const b of this.bugs) {
      const s = this.spriteFor(b.kind);
      const frame = s.frames[Math.floor(b.t * 6) % s.frames.length];
      ctx.globalAlpha = this.visible(b) ? 1 : 0.16;
      ctx.drawImage(frame, Math.round(b.x - s.w / 2), Math.round(b.y), s.w, s.h);
      if (b.hit > 0) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = PALETTE.w;
        ctx.fillRect(Math.round(b.x - 2), Math.round(b.y + s.h / 2 - 2), 4, 4);
      }
      ctx.globalAlpha = 1;
    }

    const player = this.sprites.player;
    ctx.drawImage(player.frames[0], Math.round(this.px - player.w / 2), PLAYER_Y, player.w, player.h);
    if (this.coffee > 0) {
      ctx.fillStyle = PALETTE.y;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.time * 12);
      ctx.fillRect(Math.round(this.px - 2), PLAYER_Y - 5, 4, 2);
      ctx.globalAlpha = 1;
    }

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    this.drawHud();
    this.publish();
  }

  /** Mirrors a little state onto the canvas element (only when it changes), for tests and tooling. */
  private publish() {
    const data = this.ctx.canvas.dataset;
    const state = { score: this.score, integrity: Math.round(this.integrity), level: this.level, px: Math.round(this.px) };
    for (const [key, value] of Object.entries(state)) {
      if (data[key] !== String(value)) data[key] = String(value);
    }
  }

  private drawBackdrop() {
    const { ctx } = this;
    const offset = this.options.reducedMotion ? 0 : (this.time * 8) % 16;
    ctx.strokeStyle = "rgba(236,235,230,0.045)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      ctx.moveTo(x + 0.25, 0);
      ctx.lineTo(x + 0.25, SERVER_TOP);
    }
    for (let y = offset - 16; y < SERVER_TOP; y += 16) {
      ctx.moveTo(0, y + 0.25);
      ctx.lineTo(W, y + 0.25);
    }
    ctx.stroke();

    // Danger zone just above the server
    const grad = ctx.createLinearGradient(0, SERVER_TOP - 40, 0, SERVER_TOP);
    grad.addColorStop(0, "rgba(242,107,58,0)");
    grad.addColorStop(1, this.onFire ? "rgba(255,93,108,0.22)" : "rgba(242,107,58,0.1)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, SERVER_TOP - 40, W, 40);
  }

  private drawServer() {
    const { ctx } = this;
    ctx.fillStyle = this.serverFlash > 0 ? "#2a1418" : "#141417";
    ctx.fillRect(0, SERVER_TOP, W, H - SERVER_TOP);
    ctx.fillStyle = PALETTE.o;
    ctx.fillRect(0, SERVER_TOP, W, 1);

    // Integrity bar
    const ratio = this.integrity / 100;
    ctx.fillStyle = "#26262b";
    ctx.fillRect(8, SERVER_TOP + 5, W - 16, 3);
    ctx.fillStyle = ratio > 0.6 ? PALETTE.G : ratio > 0.3 ? PALETTE.y : PALETTE.r;
    ctx.fillRect(8, SERVER_TOP + 5, Math.round((W - 16) * ratio), 3);

    // Rack units with blinking LEDs
    for (let i = 0; i < 6; i++) {
      const x = 10 + i * 38;
      ctx.fillStyle = "#1d1d22";
      ctx.fillRect(x, SERVER_TOP + 13, 32, 14);
      ctx.fillStyle = "#2a2a2f";
      ctx.fillRect(x + 2, SERVER_TOP + 16, 18, 1);
      ctx.fillRect(x + 2, SERVER_TOP + 19, 14, 1);
      const blink = this.options.reducedMotion ? true : Math.sin(this.time * 5 + i * 1.7) > 0;
      ctx.fillStyle = this.onFire ? PALETTE.r : blink ? PALETTE.G : "#2f4a3b";
      ctx.fillRect(x + 26, SERVER_TOP + 16, 2, 2);
      ctx.fillStyle = PALETTE.o;
      ctx.fillRect(x + 26, SERVER_TOP + 21, 2, 1);
    }
  }

  private drawHud() {
    const { ctx } = this;
    const font = this.options.font;
    ctx.textBaseline = "top";
    ctx.font = `600 7px ${font}`;

    ctx.fillStyle = "rgba(236,235,230,0.55)";
    ctx.textAlign = "left";
    ctx.fillText("SCORE", 8, 8);
    ctx.textAlign = "right";
    ctx.fillText("BEST", W - 8, 8);
    ctx.textAlign = "center";
    ctx.fillText(`SPRINT ${this.level}`, W / 2, 8);

    ctx.font = `600 10px ${font}`;
    ctx.fillStyle = PALETTE.w;
    ctx.textAlign = "left";
    ctx.fillText(String(this.score).padStart(6, "0"), 8, 17);
    ctx.textAlign = "right";
    ctx.fillStyle = PALETTE.O;
    ctx.fillText(String(Math.max(this.options.best, this.score)).padStart(6, "0"), W - 8, 17);

    ctx.font = `600 6px ${font}`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(236,235,230,0.55)";
    ctx.fillText(`PROD-01 · INTEGRITY ${Math.round(this.integrity)}%`, 8, H - 6.5);
    if (this.coffee > 0) {
      ctx.textAlign = "right";
      ctx.fillStyle = PALETTE.y;
      ctx.fillText(`☕ ${this.coffee.toFixed(1)}s`, W - 8, H - 6.5);
    }

    ctx.textAlign = "center";
    this.toasts.forEach((t, i) => {
      const age = t.max - t.life;
      ctx.globalAlpha = Math.min(1, t.life / 0.4, age / 0.15);
      ctx.font = `600 ${i === 0 ? 9 : 7}px ${font}`;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, W / 2, 96 + i * 14 - (this.options.reducedMotion ? 0 : age * 6));
    });
    ctx.globalAlpha = 1;
  }
}
