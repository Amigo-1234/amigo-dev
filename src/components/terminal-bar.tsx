/** The terminal window's title bar. Its own file, so the dock can draw it before the terminal loads. */
export function TerminalBar() {
  return (
    <div className="term-bar">
      <span aria-hidden="true" className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-[#3a3a40]" />
        <span className="size-2.5 rounded-full bg-[#3a3a40]" />
        <span className="size-2.5 rounded-full bg-[#ff3b4e]" />
      </span>
      <span className="text-xs">amigo@dev: ~/amigodev</span>
    </div>
  );
}
