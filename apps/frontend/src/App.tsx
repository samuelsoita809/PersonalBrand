import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTracker from './components/PageTracker';
import Navbar from './components/Navbar';

const App: React.FC = () => (
  <AuthProvider>
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
    </Router>
  </AuthProvider>
);



export default App;
