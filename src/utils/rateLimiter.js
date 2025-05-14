const rateLimit = new Map();

export function isRateLimited(ip, maxRequests = 10, windowMs = 60 * 1000) {
  const now = Date.now();

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, startTime: now });
    return false;
  }

  const { count, startTime } = rateLimit.get(ip);

  if (now - startTime > windowMs) {
    // Reset the rate limit window
    rateLimit.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (count >= maxRequests) {
    return true; // Rate limit exceeded
  }

  rateLimit.set(ip, { count: count + 1, startTime });
  return false;
}