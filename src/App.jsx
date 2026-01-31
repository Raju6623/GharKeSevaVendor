import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VendorAuth from './venderAuth/VendorAuth';
import VendorPanel from './vendorComponents/VendorPanel';
import VendorHome from './VendorHome';
import VendorCoupons from './vendorComponents/VendorCoupons'; // Fixed path


// Protected Route Component to check auth status on every access
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<VendorHome />} />

        {/* Authentication Page */}
        <Route path="/login" element={<VendorAuth />} />
        <Route path="/register" element={<VendorAuth />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />

        {/* Dashboard - Protected properly now */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <VendorPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/offers"
          element={
            <ProtectedRoute>
              <VendorCoupons />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;