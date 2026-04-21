import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Chatbot from './components/Chatbot';
import './index.css';
import React, { Component, ErrorInfo, ReactNode } from 'react';

// Error Boundary to prevent white screen
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4 text-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Something went wrong.</h1>
            <p className="mt-2 text-slate-600">Please try refreshing the page or logging in again.</p>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-white shadow-lg transition-all hover:bg-blue-700"
            >
              Reset Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple protected route component
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <Chatbot />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
