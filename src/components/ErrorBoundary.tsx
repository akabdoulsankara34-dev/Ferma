import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Une erreur inattendue est survenue.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let displayDetail = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed?.error) {
          displayDetail = `${parsed.error} (${parsed.operationType || 'op'} ${parsed.path || ''})`;
        }
      } catch {
        // Non-JSON error message
      }

      return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 text-[#3D4035]">
          <div className="max-w-md w-full bg-white border border-[#E9E5D8] rounded-3xl p-8 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF4F2] text-[#FF4B2B] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold font-['Outfit',sans-serif]">
              Interruption du module de gestion
            </h2>
            <p className="text-xs text-[#8A8D7C] leading-relaxed break-words">
              {displayDetail}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A6741] hover:bg-[#3D5235] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recharger l'application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
