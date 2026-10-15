// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsAuthenticated }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Mengecek apakah PIN yang diketik sama dengan PIN di file .env
    if (pin === import.meta.env.VITE_APP_PIN) {
      // Jika benar: Simpan status login, perbarui state, dan pindah ke dashboard
      localStorage.setItem('IS_LOGGED_IN', 'true');
      setIsAuthenticated(true);
      navigate('/dashboard');
    } else {
      // Jika salah: Munculkan pesan error dan kosongkan input
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔒 Masukkan PIN</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="password" 
            placeholder="PIN Rahasia" 
            className="input-field"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '20px' }}
          />
          
          {error && (
            <div style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>
              PIN salah! Silakan coba lagi.
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            Buka Kunci
          </button>
        </form>
      </div>
    </div>
  );
}