"use client"

import { type CSSProperties } from "react"
import { motion, useReducedMotion } from "motion/react"
import "@fontsource/bangers/400.css"

import { cn } from "@/lib/utils"

type ComicTextProps = {
  children: string
  className?: string
  style?: CSSProperties
  fontSize?: number
  /** [AMIGODEV] Halftone dot, fill and outline colours, so the text can follow the site palette. */
  dotColor?: string
  backgroundColor?: string
  strokeColor?: string
  /** [AMIGODEV] Render as this element (a heading, for example) instead of a div. */
  as?: "div" | "p" | "span" | "h2" | "h3"
}

export function ComicText({
  children,
  className,
  style,
  fontSize = 5,
  dotColor = "#EF4444",
  backgroundColor = "#FACC15",
  strokeColor = "#000000",
  as = "div",
}: ComicTextProps) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  if (typeof children !== "string") {
    throw new Error("children must be a string")
  }

  return (
    <Tag
      // [AMIGODEV] "comic-text" lets the stylesheet show it when JavaScript never runs (the entrance starts at opacity 0).
      className={cn("comic-text text-center select-none", className)}
      style={{
        fontSize: `${fontSize}rem`,
        fontFamily: "'Bangers', 'Comic Sans MS', 'Impact', sans-serif",
        fontWeight: "900",
        WebkitTextStroke: `${fontSize * 0.35}px ${strokeColor}`, // Thick outline
        transform: "skewX(-10deg)",
        textTransform: "uppercase",
        filter: `
          drop-shadow(5px 5px 0px ${strokeColor}) 
          drop-shadow(3px 3px 0px ${dotColor})
        `,
        backgroundColor: backgroundColor,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: "8px 8px",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        ...style,
      }}
      initial={reduce ? false : { opacity: 0, scale: 0.8, rotate: -2 }}
      // [AMIGODEV] Pops in when scrolled into view, not on mount far below the fold.
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 0.6,
        ease: [0.175, 0.885, 0.32, 1.275],
        type: "spring",
      }}
    >
      {children}
    </Tag>
  )
}

