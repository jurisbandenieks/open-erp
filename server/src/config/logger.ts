const levels = ["error", "warn", "info", "debug"] as const;
type Level = (typeof levels)[number];

const isDev = process.env.NODE_ENV !== "production";

const format = (level: Level, message: string, ...args: unknown[]) => {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  return args.length ? `${prefix} ${message} ${JSON.stringify(args)}` : `${prefix} ${message}`;
};

export const logger = {
  error: (message: string, ...args: unknown[]) =>
    console.error(format("error", message, ...args)),
  warn: (message: string, ...args: unknown[]) =>
    console.warn(format("warn", message, ...args)),
  info: (message: string, ...args: unknown[]) =>
    console.info(format("info", message, ...args)),
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.debug(format("debug", message, ...args));
  }
};
