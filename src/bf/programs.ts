import focus from "./programs/focus.bf?raw";
import sprint from "./programs/sprint.bf?raw";
import rest from "./programs/rest.bf?raw";
import coffee from "./programs/coffee.bf?raw";
import debug from "./programs/debug.bf?raw";
import ship from "./programs/ship.bf?raw";
import docs from "./programs/docs.bf?raw";
import doomscroll from "./programs/doomscroll.bf?raw";
import inspect from "./programs/inspect.bf?raw";
import reset from "./programs/reset.bf?raw";
import theme from "./programs/theme.bf?raw";

export const programs = {
  focus,
  sprint,
  rest,
  coffee,
  debug,
  ship,
  docs,
  doomscroll,
  inspect,
  reset,
} as const;

export const themeProgram = theme;
export type ProgramName = keyof typeof programs;
