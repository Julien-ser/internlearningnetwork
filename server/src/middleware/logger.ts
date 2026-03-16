import { Request, Response, NextFunction } from 'express'

interface LogError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const logger = (req: Request, res: Response, next: NextFunction) => {
  // Capture original end method
  const originalSend = res.send.bind(res)
  
  // Override res.send to log responses
  res.send = function (body) {
    // Log request after response is sent
    const statusCode = res.statusCode
    const method = req.method
    const url = req.originalUrl
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.get('User-Agent')
    
    // Only log error status codes (4xx, 5xx) to avoid too much noise
    if (statusCode >= 400) {
      // eslint-disable-next-line no-console
      console.error(`[${new Date().toISOString()}] ${method} ${url} ${statusCode} - IP: ${ip} - UA: ${userAgent}`)
      if (body && typeof body === 'object') {
        // eslint-disable-next-line no-console
        console.error('Response body:', JSON.stringify(body, null, 2))
      }
    }
    
    return originalSend(body)
  }
  
  next()
}

export const errorHandler = (
  err: LogError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'
  
  // Log error with stack trace in development
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
  // eslint-disable-next-line no-console
  console.error('Error:', err)
  // eslint-disable-next-line no-console
  console.error('Stack:', err.stack)
  
  // Don't leak stack traces in production
  const response = {
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  }
  
  res.status(statusCode).json(response)
}

// Helper to create operational errors
export const createError = (message: string, statusCode: number = 500): LogError => {
  const err = new Error(message) as LogError
  err.statusCode = statusCode
  err.isOperational = true
  return err
}
