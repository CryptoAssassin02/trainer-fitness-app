/**
 * Error tracking utility
 * 
 * This utility provides a centralized way to log and track errors.
 * In development, it logs to the console.
 * In production, it would send errors to an error tracking service like Sentry.
 */

// Basic structure for error context
interface ErrorContext {
  userId?: string;
  component?: string;
  route?: string;
  additionalInfo?: Record<string, any>;
}

// Basic error logger
class ErrorTracker {
  private static instance: ErrorTracker;
  private isInitialized = false;
  private userId?: string;

  private constructor() {}

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  // Initialize the error tracker
  public init(config?: { userId?: string }): void {
    if (this.isInitialized) {
      console.warn('ErrorTracker already initialized');
      return;
    }

    this.userId = config?.userId;
    
    // In a real implementation, this would initialize the error tracking service
    // Example: Sentry.init({ dsn: process.env.SENTRY_DSN });
    
    this.isInitialized = true;
    
    // Set up global error handler
    if (typeof window !== 'undefined') {
      window.onerror = (message, source, lineno, colno, error) => {
        this.captureException(error || new Error(String(message)), {
          additionalInfo: { source, lineno, colno }
        });
        return false;
      };
      
      window.onunhandledrejection = (event) => {
        this.captureException(event.reason, {
          additionalInfo: { type: 'unhandled_promise_rejection' }
        });
      };
    }
    
    console.log('ErrorTracker initialized');
  }

  // Set user ID
  public setUser(userId: string): void {
    this.userId = userId;
  }

  // Log errors
  public captureException(error: Error, context?: ErrorContext): void {
    if (!this.isInitialized) {
      console.warn('ErrorTracker not initialized');
    }
    
    const fullContext = {
      ...context,
      userId: context?.userId || this.userId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    };
    
    // In development, log to console
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error captured:', error);
      console.error('Context:', fullContext);
    }
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
      // Example: Sentry.setContext('error_context', fullContext);
      
      // For now, just log to console
      console.error('Error in production:', error.message);
    }
  }

  // Log messages
  public captureMessage(message: string, context?: ErrorContext): void {
    if (!this.isInitialized) {
      console.warn('ErrorTracker not initialized');
    }
    
    const fullContext = {
      ...context,
      userId: context?.userId || this.userId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    };
    
    // In development, log to console
    if (process.env.NODE_ENV !== 'production') {
      console.log('Message captured:', message);
      console.log('Context:', fullContext);
    }
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureMessage(message);
      // Example: Sentry.setContext('message_context', fullContext);
      
      // For now, just log to console
      console.log('Message in production:', message);
    }
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();

// Helper function for wrapping async functions with error tracking
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorTracker.captureException(error as Error, context);
      throw error;
    }
  };
} 