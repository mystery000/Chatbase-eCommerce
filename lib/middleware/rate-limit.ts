import { get, set } from 'lodash';

const rateLimit = 1; // Number of allowed requests per minute

interface RateLimiter {
  [ip: string]: number[];
}

const rateLimiter: RateLimiter = {};

type rateLimitMiddlewareType = {
  ip: string;
  rateLimit?: number;
  windowMs?: number;
  message?: string;
};

const rateLimiterMiddleware = ({
  ip,
  rateLimit = 10,
  windowMs = 60 * 1000,
}: rateLimitMiddlewareType): boolean => {
  const now = Date.now();
  const windowStart = now - 60 * 1000; // 1 minute ago
  const requestTimestamps = get(rateLimiter, ip, []).filter(
    (timestamp: number) => timestamp > windowStart,
  );
  requestTimestamps.push(now);
  set(rateLimiter, ip, requestTimestamps);
  return requestTimestamps.length <= rateLimit;
};

export default rateLimiterMiddleware;
