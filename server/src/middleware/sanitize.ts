import { Request, Response, NextFunction } from 'express'
import xss from 'xss'

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return xss(value, { 
      whiteList: {}, 
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    })
  }
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item))
  }
  if (typeof value === 'object' && value !== null) {
    const sanitized: Record<string, unknown> = {}
    for (const key in value) {
      sanitized[key] = sanitizeValue((value as Record<string, unknown>)[key])
    }
    return sanitized
  }
  return value
}

export const sanitize = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body) as Record<string, unknown>
  }
  next()
}
