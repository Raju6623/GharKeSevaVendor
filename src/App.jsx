import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VendorAuth from './venderAuth/VendorAuth';
import VendorPanel from '../VenderPannel';


function App() {
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Default route VendorAuth par jayega */}
        <Route path="/" element={<VendorAuth />} />
        {/* Dashboard sirf tab khulega jab token hoga */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated() ? <VendorPanel /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;