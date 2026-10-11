// src/App.jsx
import { useState, useEffect } from 'react';

// Daftar kategori baku (bisa ditambah nanti)
const DAFTAR_KATEGORI = ["Makan Besar", "Jajan", "Transportasi", "Parkir", "Hiburan", "Lainnya"];

function App() {
  // --- STATE GLOBAL ---
  const [saldoEndapan, setSaldoEndapan] = useState(() => {
    const saldoTersimpan = localStorage.getItem('SALDO_ENDAPAN');
    return saldoTersimpan ? Number(saldoTersimpan) : 0;
  });

  useEffect(() => {
    localStorage.setItem('SALDO_ENDAPAN', saldoEndapan);
  }, [saldoEndapan]);

  // --- STATE URUNAN & MODE ---
  const [urunanCowok, setUrunanCowok] = useState(0);
  const [urunanCewek, setUrunanCewek] = useState(0);
  const [isCheatDay, setIsCheatDay] = useState(false); 

  // --- STATE PENGELUARAN ---
  const [pengeluaran, setPengeluaran] = useState([]);
  const [namaBarang, setNamaBarang] = useState('');
  const [hargaBarang, setHargaBarang] = useState('');
  // (BARU) State untuk pilihan Kategori
  const [kategoriBarang, setKategoriBarang] = useState(DAFTAR_KATEGORI[0]);

  // --- DERIVED STATE ---
  const totalUrunan = urunanCowok + urunanCewek;
  const totalPengeluaran = pengeluaran.reduce((total, item) => total + item.harga, 0);
  const sisaHariIni = totalUrunan - totalPengeluaran;
  const proyeksiSaldoAkhir = saldoEndapan + sisaHariIni;

  // (BARU) Mengelompokkan pengeluaran berdasarkan kategori
  // Hasilnya akan seperti: { "Makan Besar": 50000, "Jajan": 20000 }
  const ringkasanKategori = pengeluaran.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = 0;
    acc[item.kategori] += item.harga;
    return acc;
  }, {});

  // --- FUNGSI AKSI ---
  const handleTambahPengeluaran = (e) => {
    e.preventDefault();
    if (!namaBarang || !hargaBarang) return;

    const itemBaru = { 
      id: Date.now(), 
      nama: namaBarang, 
      harga: Number(hargaBarang),
      kategori: kategoriBarang // (BARU) Masukkan kategori ke data item
    };
    setPengeluaran([...pengeluaran, itemBaru]);
    setNamaBarang('');
    setHargaBarang('');
    // Kategori tidak di-reset agar mudah menginput barang dengan kategori yang sama berturut-turut
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

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '50px' }}>
      <h1>Aplikasi Dana Kencan 💸</h1>

      {/* KARTU ENDAPAN */}
      <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: 0 }}>Total Saldo Endapan Saat Ini</h2>
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>
          Rp {saldoEndapan.toLocaleString('id-ID')}
        </div>
      </div>
      
      {/* KARTU URUNAN */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>1. Urunan Hari Ini</h2>
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: isCheatDay ? '#fef08a' : '#f3f4f6', borderRadius: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            <input type="checkbox" checked={isCheatDay} onChange={(e) => setIsCheatDay(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            👑 Aktifkan Mode Cheat Day
          </label>
        </div>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label>Cowok (Rp):</label>
            <input type="number" value={urunanCowok || ''} onChange={(e) => setUrunanCowok(Number(e.target.value))} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Cewek (Rp):</label>
            <input type="number" value={urunanCewek || ''} onChange={(e) => setUrunanCewek(Number(e.target.value))} style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>
      </div>

      {/* KARTU PENGELUARAN */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>2. Daftar Pengeluaran</h2>
        <form onSubmit={handleTambahPengeluaran} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          
          {/* (BARU) Baris pertama: Nama & Kategori */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Nama Barang" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} style={{ flex: 2, padding: '8px' }} />
            <select value={kategoriBarang} onChange={(e) => setKategoriBarang(e.target.value)} style={{ flex: 1, padding: '8px' }}>
              {DAFTAR_KATEGORI.map(kat => (
                <option key={kat} value={kat}>{kat}</option>
              ))}
            </select>
          </div>

          {/* Baris kedua: Harga & Tombol */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" placeholder="Harga (Rp)" value={hargaBarang} onChange={(e) => setHargaBarang(e.target.value)} style={{ flex: 2, padding: '8px' }} />
            <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tambah</button>
          </div>
        </form>

        <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
          {pengeluaran.map((item) => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{item.nama}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.kategori}</div>
              </div>
              <span style={{ fontWeight: '500' }}>Rp {item.harga.toLocaleString('id-ID')}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* KARTU RINGKASAN & PERSENTASE */}
      <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
        <h2>3. Ringkasan Hari Ini</h2>
        
        {/* --- (BARU) BAGIAN PERSENTASE KATEGORI --- */}
        {totalPengeluaran > 0 && (
          <div style={{ marginTop: '15px', marginBottom: '15px', padding: '15px', backgroundColor: '#374151', borderRadius: '6px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#9ca3af' }}>Persentase Pengeluaran:</h3>
            {Object.entries(ringkasanKategori).map(([kategori, totalHarga]) => {
              const persentase = Math.round((totalHarga / totalPengeluaran) * 100);
              return (
                <div key={kategori} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                  <span>{kategori} ({persentase}%)</span>
                  <span>Rp {totalHarga.toLocaleString('id-ID')}</span>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>Total Urunan:</span>
          <span>Rp {totalUrunan.toLocaleString('id-ID')}</span>
        </div>
        {isCheatDay && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: '#fcd34d' }}>
            <span>+ Ekstra Budget:</span>
            <span>Rp {saldoEndapan.toLocaleString('id-ID')}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#f87171' }}>
          <span>Total Pengeluaran:</span>
          <span>- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
        </div>
        <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: sisaHariIni < 0 ? '#f87171' : '#34d399' }}>
          <span>{sisaHariIni < 0 ? 'Defisit Hari Ini:' : 'Sisa (Masuk Endapan):'}</span>
          <span>Rp {sisaHariIni.toLocaleString('id-ID')}</span>
        </div>
        
        {!isCheatDay && sisaHariIni < 0 && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '14px' }}>
            ⚠️ <strong>Perhatian:</strong> Pengeluaran melebihi urunan. Defisit ini memotong Endapan.
          </div>
        )}
        {proyeksiSaldoAkhir < 0 && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '4px', fontSize: '14px' }}>
            ❌ <strong>BAHAYA:</strong> Pengeluaran melebihi gabungan urunan dan endapan!
          </div>
        )}

        <button 
          onClick={handleTutupSesi}
          style={{ width: '100%', padding: '12px', marginTop: '20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Tutup Sesi & Simpan ke Endapan
        </button>
      </div>
    </div>
  );
}

export default App;