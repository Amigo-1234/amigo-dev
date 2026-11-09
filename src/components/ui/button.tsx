import { type ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

/*
 * The shadcn/ui Button API (variant, size), drawn in this site's own button
 * styles so pasted components (Confetti's ConfettiButton) match ButtonLink.
 * No class-variance-authority or Radix Slot: the site needs neither.
 */
type Variant = "default" | "outline" | "ghost" | "secondary" | "link" | "destructive";
type Size = "default" | "sm" | "lg" | "icon";

export type ButtonProps = ComponentPropsWithRef<"button"> & { variant?: Variant; size?: Size };

const variants: Record<Variant, string> = {
  default: "bg-fg text-ink hover:-translate-y-0.5",
  destructive: "bg-accent text-accent-fg hover:-translate-y-0.5",
  outline: "border border-line-strong text-fg hover:border-fg hover:-translate-y-0.5",
  secondary: "bg-surface-strong text-fg hover:bg-line",
  ghost: "text-fg-muted hover:text-fg",
  link: "text-fg underline-offset-4 hover:underline",
};
const sizes: Record<Size, string> = {
  default: "h-12 px-6",
  sm: "h-9 px-4 text-[0.8125rem]",
  lg: "h-14 px-8 text-base",
  icon: "size-12",
};

export function buttonVariants({ variant = "default", size = "default", className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-[transform,background-color,border-color,color] duration-300 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}
