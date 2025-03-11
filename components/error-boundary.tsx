// Create file: components/error-boundary.tsx

"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree.
 * It logs errors and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error("Uncaught error:", error, errorInfo)
    
    // You could also log the error to an error reporting service
    // Example: logErrorToService(error, errorInfo)
    
    this.setState({ errorInfo })
    
    // Show a toast notification
    toast.error("An error occurred. See console for details.")
  }
  
  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <div className="mb-4 text-muted-foreground">
            <p>We apologize for the inconvenience. An error has occurred in this section of the app.</p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="mt-4 p-4 bg-muted rounded-md overflow-auto text-sm max-w-full">
                {this.state.error.toString()}
                {this.state.errorInfo && (
                  <div className="mt-2 text-xs">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </pre>
            )}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button onClick={this.handleReset}>
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary