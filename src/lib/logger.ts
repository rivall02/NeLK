/**
 * Safe structured logger for production observability.
 * Automatically masks sensitive tokens, passwords, and PII.
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "authorization",
  "apikey",
  "api_key",
  "cookie",
  "email",
];

function sanitize(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((s) =>
      key.toLowerCase().includes(s)
    );

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else if (typeof value === "string" && value.length > 500) {
      sanitized[key] = `${value.slice(0, 100)}... [TRUNCATED ${value.length} chars]`;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message,
        ...(context ? { context: sanitize(context) } : {}),
      })
    );
  },

  warn(message: string, context?: Record<string, any>) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        message,
        ...(context ? { context: sanitize(context) } : {}),
      })
    );
  },

  error(message: string, error?: any, context?: Record<string, any>) {
    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: process.env.NODE_ENV === "development" ? error.stack : undefined }
        : error;

    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message,
        error: errorDetails,
        ...(context ? { context: sanitize(context) } : {}),
      })
    );
  },
};
