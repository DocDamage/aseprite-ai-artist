/**
 * The look of a toggle-group item, shared by the toggle itself and by `Link`, so a row of
 * in-page jump links reads as the same control as the filters next to it. "On" is bits-ui's
 * `data-state=on` for a toggle and `aria-current` for a link.
 */
export const toggleItemClass =
	'relative inline-flex h-10 min-w-10 cursor-pointer items-center justify-center bg-transparent px-3 text-[0.625rem] transition-transform hover:bg-accent hover:text-accent-foreground active:translate-x-1 active:translate-y-1 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground';
