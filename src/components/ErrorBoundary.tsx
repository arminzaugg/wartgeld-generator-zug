import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-4 max-w-md mt-8">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Etwas ist schiefgelaufen</AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={this.handleReset}
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Neu laden
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}