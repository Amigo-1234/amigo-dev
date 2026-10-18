"use client";

import { openCommandMenu } from "./command-menu";

export function SearchButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={openCommandMenu} className={className}>
      {children}
    </button>
  );
}
