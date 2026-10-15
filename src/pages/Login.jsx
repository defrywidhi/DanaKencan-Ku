// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Login({ setIsAuthenticated }) {
  const [pin, setPin] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pin) return;

    setIsLoggingIn(true);

    try {
      // Mengirim PIN ke Google Apps Script (Backend) untuk dicek
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: "login", 
          pin: pin 
        })
      });
      const result = await response.json();

      if (result.status === "sukses") {
        // Jika backend bilang sukses, izinkan masuk
        localStorage.setItem('IS_LOGGED_IN', 'true');
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        // Jika backend bilang gagal
        Swal.fire('Gagal Masuk', 'PIN yang Anda masukkan salah.', 'error');
        setPin('');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal terhubung ke server keamanan. Cek koneksi internet Anda.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e3a8a' }}>🔒 Masukkan PIN</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="password" 
            placeholder="PIN Akses" 
            className="input-field"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '24px' }}
            disabled={isLoggingIn}
          />

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoggingIn}
            style={{ backgroundColor: isLoggingIn ? '#93c5fd' : '#2b50c7' }}
          >
            {isLoggingIn ? '⏳ Memeriksa...' : 'Buka Kunci'}
          </button>
        </form>
      </div>
    </div>
  );
}