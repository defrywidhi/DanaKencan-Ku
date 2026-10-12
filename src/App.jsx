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
  
  // (DIUBAH) Logika 'Sisa Hari Ini' sekarang cerdas menyesuaikan mode
  const sisaHariIni = isCheatDay 
    ? (saldoEndapan + totalUrunan) - totalPengeluaran 
    : totalUrunan - totalPengeluaran;

  // (DIUBAH) Saldo akhir mengikuti logika sisa hari ini
  const proyeksiSaldoAkhir = isCheatDay 
    ? sisaHariIni // Di Cheat Day, sisa uang gabungan otomatis menjadi saldo akhir baru
    : saldoEndapan + sisaHariIni; // Di Normal, endapan lama ditambah sisa/defisit hari ini

  const ringkasanKategori = pengeluaran.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = 0;
    acc[item.kategori] += item.harga;
    return acc;
  }, {});

  // (BARU) State loading
  const [isSaving, setIsSaving] = useState(false); // (BARU) State loading

  // --- 4. FUNGSI AKSI ---
  const handleTambahPengeluaran = (itemBaru) => {
    setPengeluaran([...pengeluaran, itemBaru]);
  };

  // (DIUBAH) Tambahkan kata kunci 'async' karena kita akan menghubungi internet
  const handleTutupSesi = async () => {
    const yakin = window.confirm("Tutup sesi hari ini dan simpan ke Database?");
    if (!yakin) return; 

    // 1. Mulai animasi loading
    setIsSaving(true);

    // 2. Siapkan data persis seperti yang diharapkan Apps Script
    const payloadData = {
      isCheatDay: isCheatDay,
      saldoEndapanAwal: saldoEndapan, // <--- (BARU) Kirim saldo sebelum ditutup
      urunanCowok: urunanCowok,
      urunanCewek: urunanCewek,
      totalPengeluaran: totalPengeluaran,
      sisaHariIni: sisaHariIni,
      saldoEndapanBaru: proyeksiSaldoAkhir,
      pengeluaran: pengeluaran
    };

    try {
      // 3. Mengirim data (API Call menggunakan fetch)
      // Trik Apps Script: Kita pakai text/plain agar tidak terkena error CORS block di browser
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify(payloadData)
      });

      const result = await response.json();

      if (result.status === "sukses") {
        // 4. Jika sukses disimpan di database, baru kita ubah state lokal (reset)
        setSaldoEndapan(proyeksiSaldoAkhir);
        setUrunanCowok(0);
        setUrunanCewek(0);
        setPengeluaran([]);
        setIsCheatDay(false);
        alert("✅ Data berhasil disimpan ke Google Sheets!");
      } else {
        alert("❌ Gagal menyimpan: " + result.pesan);
      }
    } catch (error) {
      // Menangkap error jika internet mati atau URL salah
      console.error(error);
      alert("❌ Terjadi kesalahan jaringan. Cek koneksi internet Anda.");
    } finally {
      // 5. Matikan animasi loading apapun yang terjadi (sukses/gagal)
      setIsSaving(false);
    }
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
        isSaving={isSaving} 
      />
    </div>
  );
}

export default App;