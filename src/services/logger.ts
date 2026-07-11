const IS_DEV = process.env.EXPO_PUBLIC_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  screen?:   string;
  userId?:   string;
  errorCode?:string;
  [key: string]: unknown;
}

// Strip any fields that must never appear in logs
function sanitize(meta: LogMeta): LogMeta {
  const clean = { ...meta };
  delete (clean as any).access_token;
  delete (clean as any).refresh_token;
  delete (clean as any).device_uuid;
  delete (clean as any).password;
  return clean;
}

function log(level: LogLevel, message: string, meta: LogMeta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitize(meta),
  };

  if (IS_DEV) {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[37m',
      info:  '\x1b[36m',
      warn:  '\x1b[33m',
      error: '\x1b[31m',
    };
    console.log(`${colors[level]}[${level.toUpperCase()}]\x1b[0m`, JSON.stringify(entry, null, 2));
  }

  // In staging/production, send to remote crash reporter (Sentry)
  if (!IS_DEV && level === 'error') {
    // Sentry.captureMessage(message, { extra: entry });
  }
}

export const logger = {
  debug: (msg: string, meta?: LogMeta) => log('debug', msg, meta),
  info:  (msg: string, meta?: LogMeta) => log('info',  msg, meta),
  warn:  (msg: string, meta?: LogMeta) => log('warn',  msg, meta),
  error: (msg: string, meta?: LogMeta) => log('error', msg, meta),
};
