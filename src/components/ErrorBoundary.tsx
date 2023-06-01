import React from "react";

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
    name?: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { name: null, error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    const errorObject = {
      error: error,
      errorInfo: errorInfo,
      name: this.props.name,
    };
    this.setState(errorObject);
    console.log(errorObject);
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;