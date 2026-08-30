/**
 * In-memory sliding-window rate limiter for server action & API route protection.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 10 * 60 * 1000);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref?.();

export function checkRateLimit(
  key: string,
  maxRequests = 30,
  windowMs = 60 * 1000
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return { success: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}

export function enforceRateLimit(
  key: string,
  maxRequests = 30,
  windowMs = 60 * 1000,
  actionName = "Operasi"
) {
  const result = checkRateLimit(key, maxRequests, windowMs);
  if (!result.success) {
    const waitSeconds = Math.ceil(result.resetMs / 1000);
    throw new Error(
      `Terlalu banyak permintaan untuk ${actionName}. Silakan coba lagi dalam ${waitSeconds} detik.`
    );
  }
}
