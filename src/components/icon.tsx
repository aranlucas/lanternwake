type IconProps = { name: "lantern" | "rewind" | "wait" | "undo" | "restart" | "sound" | "mute" | "book" | "close" | "up" | "down" | "left" | "right" | "pause"; size?: number };
const PATHS: Record<IconProps["name"], string> = {
  lantern: "M8 8h8l-1 12H9L8 8Zm2 0V5a2 2 0 0 1 4 0v3M12 11v5M7 20h10",
  rewind: "m11 6-7 6 7 6V6Zm9 0-7 6 7 6V6Z", wait: "M7 3h10M7 21h10M8 3c0 6 8 12 8 18M16 3c0 6-8 12-8 18",
  undo: "M8 4 3 9l5 5M3 9h10a7 7 0 1 1 0 14", restart: "M20 8a9 9 0 1 0 1 8M20 3v6h-6",
  sound: "m4 9 5 0 5-5v16l-5-5H4V9Zm14-2a7 7 0 0 1 0 10", mute: "m4 9 5 0 5-5v16l-5-5H4V9Zm14 0 4 6m0-6-4 6",
  book: "M3 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H3V4Zm18 0h-6a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h6V4ZM6 8h3m6 0h3",
  close: "m6 6 12 12M18 6 6 18", up: "m5 14 7-7 7 7", down: "m5 10 7 7 7-7", left: "m14 5-7 7 7 7", right: "m10 5 7 7-7 7", pause: "M8 5v14M16 5v14"
};
export function Icon({ name, size = 20 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PATHS[name]} /></svg>;
}
