import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTracker from './components/PageTracker';
import Navbar from './components/Navbar';

import { ChatProvider } from './context/ChatContext';
import ChatButton from './components/chat/ChatButton';
import ChatModal from './components/chat/ChatModal';

const App: React.FC = () => (
  <AuthProvider>
    <ChatProvider>
      <Router>
        <PageTracker />
        <Navbar />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<div>About Page (Coming Soon)</div>} />
          </Routes>
        </div>
        <ChatButton />
        <ChatModal />
      </Router>
    </ChatProvider>
  </AuthProvider>
);



export default App;
