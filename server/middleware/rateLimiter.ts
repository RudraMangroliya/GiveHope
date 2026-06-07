import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter applied to general API routes.
 * Limits each IP to 300 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

/**
 * Stricter rate limiter for authentication/login/register routes to prevent brute-force attacks.
 * Limits each IP to 50 attempts per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});
