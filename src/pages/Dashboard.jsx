// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UrunanCard from '../components/UrunanCard';
import PengeluaranCard from '../components/PengeluaranCard';
import RingkasanCard from '../components/RingkasanCard';
import Swal from 'sweetalert2';

export default function Dashboard() {
    const navigate = useNavigate();

  // --- 1. GLOBAL STATE (Disinkronkan dengan Database) ---
    const [saldoEndapan, setSaldoEndapan] = useState(0);
    const [isLoadingSaldo, setIsLoadingSaldo] = useState(true); // (BARU) Indikator loading saldo

  // (BARU) Menarik saldo terakhir dari Database saat pertama kali buka
    useEffect(() => {
    const fetchSaldoDariDatabase = async () => {
    try {
        const response = await fetch(import.meta.env.VITE_API_URL);
        const result = await response.json();
        
        if (result.status === "sukses" && result.data.length > 0) {
          // Ambil baris terakhir dari data yang dikirim Apps Script
        const sesiTerakhir = result.data[result.data.length - 1];
          // Set saldo berdasarkan kolom 'Saldo Endapan Akhir'
        const saldoAsli = Number(sesiTerakhir['Saldo Endapan Akhir']);
        setSaldoEndapan(saldoAsli);
        
          // Simpan juga ke local storage sebagai backup offline
        localStorage.setItem('SALDO_ENDAPAN', saldoAsli);
        } else if (result.data.length === 0) {
          // Jika database masih kosong murni
        setSaldoEndapan(0);
        }
        } catch (error) {
        console.error("Gagal menarik data dari server:", error);
        // Fallback: Jika internet mati/error, pakai sisa memori di HP
        const saldoBackup = localStorage.getItem('SALDO_ENDAPAN');
        if (saldoBackup) setSaldoEndapan(Number(saldoBackup));
        } finally {
        setIsLoadingSaldo(false);
        }
    };

    fetchSaldoDariDatabase();
  }, []); // Array kosong = hanya berjalan sekali saat buka web

  // --- 2. LOCAL STATE ---
    const [urunanCowok, setUrunanCowok] = useState(0);
    const [urunanCewek, setUrunanCewek] = useState(0);
    const [isCheatDay, setIsCheatDay] = useState(false); 
    const [pengeluaran, setPengeluaran] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

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

    // --- 4. FUNGSI AKSI ---
    const handleTambahPengeluaran = (itemBaru) => {
        setPengeluaran([...pengeluaran, itemBaru]);
    };

    // (BARU) Fungsi untuk menghapus item dari daftar sementara sebelum disimpan
    const handleHapusPengeluaranLokal = (idItemYangMauDihapus) => {
        // Memfilter array: Ambil semua item yang ID-nya TIDAK SAMA dengan ID yang mau dihapus
    const pengeluaranBaru = pengeluaran.filter(item => item.id !== idItemYangMauDihapus);
        setPengeluaran(pengeluaranBaru);
    };

    const handleTutupSesi = async () => {
    // (DIUBAH) Menggunakan SweetAlert untuk Konfirmasi
    const konfirmasi = await Swal.fire({
    title: 'Tutup Sesi Hari Ini?',
    text: "Sisa uang akan dimasukkan ke Saldo Endapan dan data akan disimpan ke Database.",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Tutup & Simpan!',
    cancelButtonText: 'Batal'
    });

    if (!konfirmasi.isConfirmed) return; 

    setIsSaving(true);
    const idSesiUnik = `SESI-${Date.now()}`;

    const payloadData = {
    action: "simpan",
    idSesi: idSesiUnik,
    isCheatDay: isCheatDay,
    saldoEndapanAwal: saldoEndapan,
    urunanCowok: urunanCowok,
    urunanCewek: urunanCewek,
    totalPengeluaran: totalPengeluaran,
    sisaHariIni: sisaHariIni,
    saldoEndapanBaru: proyeksiSaldoAkhir,
    pengeluaran: pengeluaran
    };

    try {
    const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payloadData)
    });

    const result = await response.json();

    if (result.status === "sukses") {
        setSaldoEndapan(proyeksiSaldoAkhir);
        setUrunanCowok(0);
        setUrunanCewek(0);
        setPengeluaran([]);
        setIsCheatDay(false);
        // (DIUBAH) Pemberitahuan Sukses
        Swal.fire('Berhasil!', 'Data kencan berhasil disimpan ke Database.', 'success');
    } else {
        // (DIUBAH) Pemberitahuan Gagal
        Swal.fire('Gagal!', 'Tidak dapat menyimpan: ' + result.pesan, 'error');
    }
    } catch (error) {
    console.error(error);
    Swal.fire('Error Jaringan', 'Periksa koneksi internet Anda.', 'error');
    } finally {
    setIsSaving(false);
    }
};

  // --- 5. TAMPILAN (UI) ---
  // Bagian bawah src/App.jsx
    return (
    <div className="app-container">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h1>Dana Kencan 💸</h1>
        <button 
        onClick={() => navigate('/riwayat')}
        className="btn" 
        style={{ backgroundColor: '#4b5563', color: 'white', padding: '8px 12px', fontSize: '14px' }}
        >
        📄 Lihat Riwayat
        </button>
    </div>

      {/* KARTU ENDAPAN GLOBAL */}
    <div className="card-highlight">
        <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: 0 }}>Total Saldo Endapan Saat Ini</h2>
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>
        {isLoadingSaldo ? '⏳ Sedang sinkronisasi...' : `Rp ${saldoEndapan.toLocaleString('id-ID')}`}
        </div>
    </div>
    
      {/* ... pemanggilan komponen lain tetap sama persis ... */}
        <UrunanCard isCheatDay={isCheatDay} setIsCheatDay={setIsCheatDay} urunanCowok={urunanCowok} setUrunanCowok={setUrunanCowok} urunanCewek={urunanCewek} setUrunanCewek={setUrunanCewek} />
        <PengeluaranCard pengeluaran={pengeluaran} onTambahPengeluaran={handleTambahPengeluaran} onHapusPengeluaran={handleHapusPengeluaranLokal} />
        <RingkasanCard totalUrunan={totalUrunan} totalPengeluaran={totalPengeluaran} sisaHariIni={sisaHariIni} proyeksiSaldoAkhir={proyeksiSaldoAkhir} isCheatDay={isCheatDay} saldoEndapan={saldoEndapan} ringkasanKategori={ringkasanKategori} onTutupSesi={handleTutupSesi} isSaving={isSaving} />
    </div>
    );
}