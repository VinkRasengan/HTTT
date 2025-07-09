import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './contexts/SocketContext';
import { EmulatorProvider } from './contexts/EmulatorContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EmulatorManager from './pages/EmulatorManager';
import MessagingPage from './pages/MessagingPage';
import CallPage from './pages/CallPage';
import NetworkConfig from './pages/NetworkConfig';

function App() {
  return (
    <SocketProvider>
      <EmulatorProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/emulators" element={<EmulatorManager />} />
                <Route path="/messaging" element={<MessagingPage />} />
                <Route path="/calls" element={<CallPage />} />
                <Route path="/network" element={<NetworkConfig />} />
              </Routes>
            </Layout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </EmulatorProvider>
    </SocketProvider>
  );
}

export default App;
