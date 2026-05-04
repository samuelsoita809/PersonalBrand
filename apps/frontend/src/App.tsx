import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTracker from './components/PageTracker';
import Navbar from './components/Navbar';

import { ChatProvider } from './context/ChatContext';
import { ModalProvider } from './context/ModalContext';
import ChatButton from './components/chat/ChatButton';
import ChatModal from './components/chat/ChatModal';
import GlobalModals from './components/modals/GlobalModals';

const App: React.FC = () => (
  <AuthProvider>
    <ModalProvider>
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
          <GlobalModals />
        </Router>
      </ChatProvider>
    </ModalProvider>
  </AuthProvider>
);



export default App;
