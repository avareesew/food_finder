export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogDetails {
  [key: string]: unknown;
}

const formatEntry = (level: LogLevel, event: string, details?: LogDetails) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    details: details ?? {},
  };
  return `[Scavenger][${level}] ${JSON.stringify(entry)}`;
};

export const logger = {
  info(event: string, details?: LogDetails) {
    console.info(formatEntry('info', event, details));
  },
  warn(event: string, details?: LogDetails) {
    console.warn(formatEntry('warn', event, details));
  },
  error(event: string, details?: LogDetails) {
    console.error(formatEntry('error', event, details));
  },
  debug(event: string, details?: LogDetails) {
    console.debug(formatEntry('debug', event, details));
  },
};
