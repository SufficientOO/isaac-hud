
export const Curse = {
  Darkness: 1 << 0,
  Labyrinth: 1 << 1,
  Lost: 1 << 2,
  Unknown: 1 << 3,
  Cursed: 1 << 4,
  Maze: 1 << 5,
  Blind: 1 << 6,
  Giant: 1 << 7,
} as const;

export function hasCurse(curses: number | undefined, curse: number): boolean {
  return ((curses ?? 0) & curse) !== 0;
}
