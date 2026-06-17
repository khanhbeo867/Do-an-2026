import { createMiddleware } from '@tanstack/react-start'

export const loggingMiddleware = createMiddleware({ type: 'function' }).server(
  ({ serverFnMeta, data, context, next }) => {
    console.debug(serverFnMeta.name, data)
    return next(context)
  }
)
