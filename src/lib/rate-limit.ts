const limiter = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxPerMinute = 10): boolean {
  const now = Date.now();
  const entry = limiter.get(ip);

  if (!entry || now > entry.resetAt) {
    limiter.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}
