import rateLimit from 'express-rate-limit'
import { Request, RequestHandler } from 'express'

// General API rate limiter: 100 requests per 15 minutes
export const generalRateLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter rate limiter for auth routes: 5 attempts per 15 minutes
export const authRateLimiter: RequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for skill claiming: 20 claims per hour to prevent abuse
export const claimRateLimiter: RequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each user to 20 claims per hour
  message: {
    error: 'Too many skill claims, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter for post creation: 10 posts per hour
export const postCreationRateLimiter: RequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 posts per hour
  message: {
    error: 'Too many post creations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
