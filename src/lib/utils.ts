/*
 * The `cn` that shadcn/ui and 21st.dev components import from "@/lib/utils".
 * Accepts what clsx accepts (strings, numbers, arrays, { class: condition }
 * objects) so pasted components work unchanged. It does not merge conflicting
 * Tailwind classes: later classes do not override earlier ones by themselves.
 */
type ClassValue = string | number | bigint | null | boolean | undefined | ClassDictionary | ClassValue[];
type ClassDictionary = Record<string, unknown>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const add = (v: ClassValue) => {
    if (!v && v !== 0) return;
    if (typeof v === "string" || typeof v === "number" || typeof v === "bigint") out.push(String(v));
    else if (Array.isArray(v)) v.forEach(add);
    else if (typeof v === "object") for (const [k, on] of Object.entries(v)) if (on) out.push(k);
  };
  inputs.forEach(add);
  return out.join(" ");
}
