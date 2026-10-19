// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Import semua halaman yang sudah kita buat
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Riwayat from './pages/Riwayat';
import Statistik from './pages/Statistik';

export default function App() {
  // State untuk mengecek apakah user sudah login (baca dari memori browser)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('IS_LOGGED_IN') === 'true';
  });

  // Komponen Khusus (SATPAM): Melindungi rute rahasia
  // Jika belum login, tendang kembali ke halaman /login
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children; // Jika aman, silakan masuk ke komponen yang diminta
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<Landing />} />
        
        {/* Rute Login: Kita oper setIsAuthenticated agar Login.jsx bisa mengubah status di App.jsx */}
        <Route 
          path="/login" 
          element={<Login setIsAuthenticated={setIsAuthenticated} />} 
        />
        
        {/* Rute Rahasia: Dibungkus oleh Satpam (ProtectedRoute) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* (BARU) Rute Riwayat juga harus dilindungi */}
        <Route 
          path="/riwayat" 
          element={
            <ProtectedRoute>
              <Riwayat />
            </ProtectedRoute>
          } 
        />

        {/* Rute Analitik Statistik */}
        <Route 
          path="/statistik" 
          element={
            <ProtectedRoute>
              <Statistik />
            </ProtectedRoute>
          } 
        />
        
        {/* Rute Nyasar (404): Otomatis lempar kembali ke halaman depan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}