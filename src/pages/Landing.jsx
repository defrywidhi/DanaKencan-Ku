// src/pages/Landing.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Landing() {
  // --- STATE UNTUK FORM WAITLIST ---
  const [showModal, setShowModal] = useState(false);
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // --- FUNGSI MENGIRIM DATA PEMINAT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !kontak) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          action: "tambah_peminat", 
          nama: nama, 
          kontak: kontak 
        })
      });
      const result = await response.json();
      
      if (result.status === "sukses") {
        setIsSuccess(true);
        setNama('');
        setKontak('');
      } else {
        Swal.fire('Gagal!', 'Gagal mengirim data: ' + result.pesan, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', margin: '-15px', padding: '20px' }}>
      
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* (BARU) Menampilkan logo kecil di navbar */}
          <img src="/logo-danakencan.jpg" alt="Logo" style={{ height: '30px', borderRadius: '4px' }} />
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2b50c7' }}>DanaKencan<span style={{color: '#f04276'}}>-Ku</span></div>
        </div>
        <Link to="/login" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500' }}>Masuk / Login ➔</Link>
      </nav>

      {/* HERO SECTION */}
      <header style={{ textAlign: 'center', maxWidth: '600px', margin: '50px auto 40px' }}>
        {/* (BARU) Menampilkan logo besar di tengah */}
        <img src="/logo-danakencan.jpg" alt="Logo DanaKencan-Ku" style={{ height: '120px', marginBottom: '20px', borderRadius: '12px' }} />
        
        <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#1e3a8a', lineHeight: '1.2', marginBottom: '15px' }}>
          Kelola Dana Kencan <br/>
          <span style={{ background: 'linear-gradient(to right, #f43f5e, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tanpa Drama.
          </span>
        </h1>
        {/* (DIUBAH) Menggunakan Tagline Resmi dari Logo */}
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '10px', fontWeight: '500' }}>
          "Rencana Keuangan Anda, Masa Depan Kita Bersama"
        </p>
        <p style={{ fontSize: '15px', color: '#9ca3af', marginBottom: '30px', lineHeight: '1.6' }}>
          Catat urunan, lacak pengeluaran, dan kelola saldo endapan dengan transparan dan otomatis.
        </p>
        
        {/* Tombol ini sekarang membuka Modal, bukan langsung ke Login */}
        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary" 
          style={{ padding: '15px 30px', fontSize: '18px', borderRadius: '30px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}
        >
          Mulai Gunakan Sekarang
        </button>
      </header>

      {/* FEATURE SECTION (Tetap sama) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
        <div className="flex-row flex-row-mobile-col" style={{ gap: '20px' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👑</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Mode Cheat Day</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Bebas gunakan saldo endapan tanpa takut peringatan defisit harian.</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Analisis Kategori</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Pantau persentase pengeluaran untuk Makan, Jajan, atau Transportasi.</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🖨️</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Export Laporan</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Cetak riwayat transaksi ke PDF dalam satu klik untuk transparansi.</p>
          </div>
        </div>
      </section>

      {/* --- POP-UP MODAL (FORM WAITLIST) --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', marginTop: 0 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Daftar Akses Awal</h3>
              <button 
                onClick={() => { setShowModal(false); setIsSuccess(false); }} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ❌
              </button>
            </div>

            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
                <h4 style={{ fontSize: '18px', color: '#10b981', marginBottom: '10px' }}>Terima Kasih!</h4>
                <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>
                  Sistem ini saat ini bersifat privat. Namun data Anda telah kami catat. Kami akan menghubungi Anda jika sistem ini dibuka untuk publik!
                </p>
                <button onClick={() => { setShowModal(false); setIsSuccess(false); }} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                  Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                  Aplikasi ini sedang dalam tahap uji coba tertutup. Tinggalkan kontak Anda untuk mendapatkan info saat rilis publik.
                </p>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Nama Anda</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Misal: Budi" 
                    value={nama} 
                    onChange={(e) => setNama(e.target.value)} 
                    required 
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Email / No. HP Aktif</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Misal: budi@gmail.com / 08123456" 
                    value={kontak} 
                    onChange={(e) => setKontak(e.target.value)} 
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px', backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb' }}
                >
                  {isSubmitting ? '⏳ Mengirim...' : 'Kirim Permintaan Akses'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}
      
      <footer style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', paddingBottom: '20px' }}>
        &copy; 2026 DanaKencan App. Private System.
      </footer>
    </div>
  );
}