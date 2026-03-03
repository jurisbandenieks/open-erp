const isDev = process.env.NODE_ENV !== "production";
const fmt = (level: string, msg: string, ...args: unknown[]) =>
  `[${new Date().toISOString()}] [${level}] ${msg}${args.length ? " " + JSON.stringify(args) : ""}`;

export const logger = {
  error: (msg: string, ...a: unknown[]) => console.error(fmt("ERROR", msg, ...a)),
  warn:  (msg: string, ...a: unknown[]) => console.warn(fmt("WARN", msg, ...a)),
  info:  (msg: string, ...a: unknown[]) => console.info(fmt("INFO", msg, ...a)),
  debug: (msg: string, ...a: unknown[]) => { if (isDev) console.debug(fmt("DEBUG", msg, ...a)); },
};
