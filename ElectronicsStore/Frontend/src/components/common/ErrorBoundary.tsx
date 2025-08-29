import React, { Component, ReactNode } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  enableReporting?: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: ErrorBoundary.prototype.generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    this.reportError(error, errorInfo);
  }

  generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  reportError = async (error: Error, errorInfo: React.ErrorInfo) => {
    if (!this.props.enableReporting) return;

    try {
      // In a real application, you would send this to your error reporting service
      // e.g., Sentry, Bugsnag, LogRocket, etc.
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: null, // You might want to get this from your auth store
      };

      console.log('Error report:', errorReport);
      
      // Example: Send to error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    // Clear error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    });
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  handleReload = () => {
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <ErrorFallbackUI 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
        onReload={this.handleReload}
        showDetails={this.props.showDetails}
      />;
    }

    return this.props.children;
  }
}

// Functional component for error UI
interface ErrorFallbackUIProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  onGoHome: () => void;
  onReload: () => void;
  showDetails?: boolean;
}

const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onGoHome,
  onReload,
  showDetails = false
}) => {
  const theme = useTheme();
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4
        }}
      >
        {/* Error Icon */}
        <ErrorIcon
          sx={{
            fontSize: 80,
            color: theme.palette.error.main,
            mb: 2
          }}
        />

        {/* Main Error Message */}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight="bold"
        >
          Oops! Something went wrong
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 600 }}
        >
          We're sorry, but an unexpected error has occurred. Our team has been notified 
          and is working to fix this issue. Please try one of the options below.
        </Typography>

        {/* Error ID */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4, fontFamily: 'monospace' }}
        >
          Error ID: {errorId}
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
            size="large"
          >
            Try Again
          </Button>

          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={onGoHome}
            size="large"
          >
            Go Home
          </Button>

          <Button
            variant="text"
            onClick={onReload}
            size="large"
          >
            Reload Page
          </Button>
        </Box>

        {/* Error Details (Development or if showDetails is true) */}
        {(isDevelopment || showDetails) && error && (
          <Paper
            sx={{
              width: '100%',
              maxWidth: 800,
              mt: 2,
              overflow: 'hidden'
            }}
          >
            <Alert
              severity="error"
              icon={<BugIcon />}
              sx={{ mb: 0 }}
            >
              <AlertTitle>Technical Details</AlertTitle>
              This information is only visible in development mode or when details are enabled.
            </Alert>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ backgroundColor: theme.palette.grey[50] }}
              >
                <Typography fontWeight="medium">
                  Error Message
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: theme.palette.grey[100],
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  {error.message}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {error.stack && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ backgroundColor: theme.palette.grey[50] }}
                >
                  <Typography fontWeight="medium">
                    Stack Trace
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: theme.palette.grey[100],
                      p: 2,
                      borderRadius: 1,
                      maxHeight: 300,
                      overflow: 'auto'
                    }}
                  >
                    {error.stack}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}

            {errorInfo?.componentStack && (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ backgroundColor: theme.palette.grey[50] }}
                >
                  <Typography fontWeight="medium">
                    Component Stack
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: theme.palette.grey[100],
                      p: 2,
                      borderRadius: 1,
                      maxHeight: 200,
                      overflow: 'auto'
                    }}
                  >
                    {errorInfo.componentStack}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            )}
          </Paper>
        )}

        {/* Help Text */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, maxWidth: 500 }}
        >
          If this problem persists, please contact our support team at{' '}
          <a 
            href="mailto:support@electronicsstore.com"
            style={{ color: theme.palette.primary.main }}
          >
            support@electronicsstore.com
          </a>
          {' '}and include the Error ID above.
        </Typography>
      </Box>
    </Container>
  );
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error) => {
    // This will be caught by the nearest ErrorBoundary
    throw error;
  }, []);

  return handleError;
};

// Higher-order component wrapper
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;