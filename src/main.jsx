import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CustomCursor from './components/ui/CustomCursor';
import { AuthProvider } from './context/AuthContext';
import './i18n';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-gray-400 text-sm max-w-md text-center">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (!container) throw new Error('#root not found');

if (!window.__REACT_ROOT__) {
  window.__REACT_ROOT__ = ReactDOM.createRoot(container);
}

window.__REACT_ROOT__.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <CustomCursor />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);