/*
 * Pixel sprites for DEBUG.EXE, drawn as text so they stay easy to edit.
 * Each character maps to a palette colour; "." is transparent. Frames are
 * rendered once to small offscreen canvases and then drawn scaled with
 * smoothing off, which keeps them crisp and cheap to draw every frame.
 */

export const PALETTE: Record<string, string> = {
  o: "#f26b3a", // AMIGODEV accent
  O: "#ff9a5c",
  w: "#ecebe6",
  g: "#6f6e69",
  k: "#2a2a2f",
  r: "#ff5d6c",
  c: "#5ee6d0",
  y: "#ffd166",
  p: "#b98cff",
  G: "#7fd6a0",
};

export type SpriteName = "player" | "beetle" | "spider" | "leak" | "drop" | "heisen" | "coffee" | "hotfix" | "patch";

const ART: Record<SpriteName, string[][]> = {
  player: [
    [
      "......o......",
      ".....oOo.....",
      ".....owo.....",
      "..kkkwwwkkk..",
      ".kwwwwwwwwwk.",
      ".kwcccccccwk.",
      ".kwcoccccowk.",
      "kkkkkkkkkkkkk",
      ".gg.......gg.",
    ],
  ],
  beetle: [
    ["..k...k..", "...k.k...", ".rrrrrrr.", "rrwrrrwrr", ".rrrrrrr.", "k.rrrrr.k", ".k.....k."],
    ["..k...k..", "...k.k...", ".rrrrrrr.", "rrwrrrwrr", ".rrrrrrr.", ".krrrrrk.", "k.......k"],
  ],
  spider: [
    ["p.......p", ".p.ppp.p.", "..ppppp..", "ppwpppwpp", "..ppppp..", ".p.....p.", "p.......p"],
    [".p.....p.", "p..ppp..p", "..ppppp..", "ppwpppwpp", "..ppppp..", "p.......p", ".p.....p."],
  ],
  leak: [
    ["...GGGGG...", "..GGGGGGG..", ".GGwGGGwGG.", ".GGGGGGGGG.", "GGGGGGGGGGG", "GGGGGGGGGGG", ".GGGGGGGGG.", "..G.GG.G...", "..G..G....."],
    ["...GGGGG...", "..GGGGGGG..", ".GGwGGGwGG.", ".GGGGGGGGG.", "GGGGGGGGGGG", "GGGGGGGGGGG", ".GGGGGGGGG.", "...GG.G.G..", ".....G..G.."],
  ],
  drop: [["..G..", ".GGG.", "GGwGG", "GGGGG", ".GGG."]],
  heisen: [
    ["...ccc...", "..c...c..", ".c.c.c.c.", "c..ccc..c", "c.ccwcc.c", "c..ccc..c", ".c.c.c.c.", "..c...c..", "...ccc..."],
    ["...c.c...", ".cc...cc.", "..c.c.c..", "c..ccc..c", "..ccwcc..", "c..ccc..c", "..c.c.c..", ".cc...cc.", "...c.c..."],
  ],
  coffee: [[".y.y...", "..y.y..", "wwwwww.", "wOOOOww", "wooooww", "wwwwww.", "......."]],
  hotfix: [["..GGG..", "..GwG..", "GGGwGGG", "GwwwwwG", "GGGwGGG", "..GwG..", "..GGG.."]],
  patch: [["O", "o", "o", "o"]],
};

/** Each sprite pixel is drawn as 2×2 world pixels, so bugs stay readable on phones. */
export const SPRITE_SCALE = 2;

/** w and h are in world pixels (already scaled); frames hold the 1:1 artwork. */
export type Sprite = { frames: HTMLCanvasElement[]; w: number; h: number };

export function buildSprites(): Record<SpriteName, Sprite> {
  const out = {} as Record<SpriteName, Sprite>;
  for (const [name, frames] of Object.entries(ART) as [SpriteName, string[][]][]) {
    const h = frames[0].length;
    const w = frames[0][0].length;
    out[name] = {
      w: w * SPRITE_SCALE,
      h: h * SPRITE_SCALE,
      frames: frames.map((rows) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return c;
        rows.forEach((row, y) => {
          [...row].forEach((ch, x) => {
            const colour = PALETTE[ch];
            if (!colour) return;
            ctx.fillStyle = colour;
            ctx.fillRect(x, y, 1, 1);
          });
        });
        return c;
      }),
    };
  }
  return out;
}
