// Create file: utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] ${message}`, ...args)
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, error, ...args)
    
    // In a production app, you would send this to an error tracking service
    // like Sentry or LogRocket
  },
}