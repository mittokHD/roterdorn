// Centralized error logger — drop-in ready for Sentry or any observability platform.
// To migrate: replace the console calls below with Sentry.captureException / Sentry.captureMessage.
//
// Install Sentry when npm registry is available:
//   npm install @sentry/nextjs
//   npx @sentry/wizard@latest -i nextjs

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${
    context ? ` | ${JSON.stringify(context)}` : ""
  }`;
}

export const logger = {
  info(message: string, context?: LogContext): void {
    console.info(formatMessage("info", message, context));
    // TODO: Sentry.addBreadcrumb({ message, level: 'info', data: context });
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatMessage("warn", message, context));
    // TODO: Sentry.captureMessage(message, { level: 'warning', extra: context });
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(formatMessage("error", message, context), error ?? "");
    // TODO: Sentry.captureException(error instanceof Error ? error : new Error(message), {
    //   extra: { message, ...context },
    // });
  },
};
