// src/App.jsx
import { useState, useEffect } from 'react';
import UrunanCard from './components/UrunanCard';
import PengeluaranCard from './components/PengeluaranCard';
import RingkasanCard from './components/RingkasanCard'; // <-- Import baru

function App() {
  // --- 1. GLOBAL STATE ---
  const [saldoEndapan, setSaldoEndapan] = useState(() => {
    const saldoTersimpan = localStorage.getItem('SALDO_ENDAPAN');
    return saldoTersimpan ? Number(saldoTersimpan) : 0;
  });

  useEffect(() => {
    localStorage.setItem('SALDO_ENDAPAN', saldoEndapan);
  }, [saldoEndapan]);

  // --- 2. LOCAL STATE ---
  const [urunanCowok, setUrunanCowok] = useState(0);
  const [urunanCewek, setUrunanCewek] = useState(0);
  const [isCheatDay, setIsCheatDay] = useState(false); 
  const [pengeluaran, setPengeluaran] = useState([]);

  // --- 3. DERIVED STATE (Perhitungan Otomatis) ---
  const totalUrunan = urunanCowok + urunanCewek;
  const totalPengeluaran = pengeluaran.reduce((total, item) => total + item.harga, 0);
  const sisaHariIni = totalUrunan - totalPengeluaran;
  const proyeksiSaldoAkhir = saldoEndapan + sisaHariIni;

  const ringkasanKategori = pengeluaran.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = 0;
    acc[item.kategori] += item.harga;
    return acc;
  }, {});

  // --- 4. FUNGSI AKSI ---
  const handleTambahPengeluaran = (itemBaru) => {
    setPengeluaran([...pengeluaran, itemBaru]);
  };

  const handleTutupSesi = () => {
    const yakin = window.confirm("Tutup sesi hari ini?");
    if (!yakin) return; 

    setSaldoEndapan(proyeksiSaldoAkhir);
    setUrunanCowok(0);
    setUrunanCewek(0);
    setPengeluaran([]);
    setIsCheatDay(false);
  };

  // --- 5. TAMPILAN (UI) ---
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '50px' }}>
      <h1>Aplikasi Dana Kencan 💸</h1>

      {/* KARTU ENDAPAN GLOBAL */}
      <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: 0 }}>Total Saldo Endapan Saat Ini</h2>
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>
          Rp {saldoEndapan.toLocaleString('id-ID')}
        </div>
      </div>
      
      <UrunanCard 
        isCheatDay={isCheatDay}
        setIsCheatDay={setIsCheatDay}
        urunanCowok={urunanCowok}
        setUrunanCowok={setUrunanCowok}
        urunanCewek={urunanCewek}
        setUrunanCewek={setUrunanCewek}
      />

      <PengeluaranCard 
        pengeluaran={pengeluaran} 
        onTambahPengeluaran={handleTambahPengeluaran} 
      />

      <RingkasanCard 
        totalUrunan={totalUrunan}
        totalPengeluaran={totalPengeluaran}
        sisaHariIni={sisaHariIni}
        proyeksiSaldoAkhir={proyeksiSaldoAkhir}
        isCheatDay={isCheatDay}
        saldoEndapan={saldoEndapan}
        ringkasanKategori={ringkasanKategori}
        onTutupSesi={handleTutupSesi}
      />
    </div>
  );
}

export default App;