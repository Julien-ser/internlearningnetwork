import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const validate = <T extends z.ZodSchema>(schema: T, options?: { source?: 'body' | 'params' | 'query' }) => {
  const source = options?.source || 'body'
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let data: unknown
      if (source === 'params') {
        data = req.params
      } else if (source === 'query') {
        data = req.query
      } else {
        data = req.body
      }
      schema.parse(data)
      next()
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        })
      }
      res.status(400).json({ error: 'Validation failed' })
    }
  }
}

export const validateUpdate = <T extends z.ZodSchema>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'No update data provided' })
      }
      schema.parse(req.body)
      next()
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        })
      }
      res.status(400).json({ error: 'Validation failed' })
    }
  }
}
