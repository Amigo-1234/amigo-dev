import type { CSSProperties, JSX } from "react";

/** Types for the React Bits ElectricLogo (electric-logo.jsx, JavaScript + CSS variant). */
export type ElectricLogoProps = {
  src?: string;
  color?: string;
  glowColor?: string;
  scale?: number;
  intensity?: number;
  glow?: number;
  thickness?: number;
  strands?: number;
  bend?: number;
  crackle?: number;
  arcs?: number;
  flicker?: number;
  fill?: number;
  speed?: number;
  interactive?: boolean;
  cursorIntensity?: number;
  cursorRadius?: number;
  theme?: "dark" | "light";
  onRender?: (canvas: HTMLCanvasElement) => void;
  className?: string;
  style?: CSSProperties;
};
declare function ElectricLogo(props: ElectricLogoProps): JSX.Element;
export default ElectricLogo;
