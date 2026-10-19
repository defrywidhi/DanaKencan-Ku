// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UrunanCard from '../components/UrunanCard';
import PengeluaranCard from '../components/PengeluaranCard';
import RingkasanCard from '../components/RingkasanCard';

export default function Dashboard() {
  const navigate = useNavigate();

  // --- 1. GLOBAL STATE (Disinkronkan dengan Database) ---
  const [saldoEndapan, setSaldoEndapan] = useState(0);
  const [isLoadingSaldo, setIsLoadingSaldo] = useState(true);
  const [showSaldo, setShowSaldo] = useState(false);

  useEffect(() => {
    const fetchSaldoDariDatabase = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL);
        const result = await response.json();
        
        if (result.status === "sukses" && result.data.length > 0) {
          const sesiTerakhir = result.data[result.data.length - 1];
          const saldoAsli = Number(sesiTerakhir['Saldo Endapan Akhir']);
          setSaldoEndapan(saldoAsli);
          localStorage.setItem('SALDO_ENDAPAN', saldoAsli);
        } else if (result.data.length === 0) {
          setSaldoEndapan(0);
        }
      } catch (error) {
        console.error("Gagal menarik data dari server:", error);
        const saldoBackup = localStorage.getItem('SALDO_ENDAPAN');
        if (saldoBackup) setSaldoEndapan(Number(saldoBackup));
      } finally {
        setIsLoadingSaldo(false);
      }
    };

    fetchSaldoDariDatabase();
  }, []);

  // --- 2. LOCAL STATE (SISTEM DRAFT LOCALSTORAGE) ---
  // Kita baca dari memori HP. Kalau kosong, pakai nilai bawaan.
  const [urunanCowok, setUrunanCowok] = useState(() => {
    const draft = localStorage.getItem('DRAFT_COWOK');
    return draft ? Number(draft) : 0;
  });

  const [urunanCewek, setUrunanCewek] = useState(() => {
    const draft = localStorage.getItem('DRAFT_CEWEK');
    return draft ? Number(draft) : 0;
  });

  const [isCheatDay, setIsCheatDay] = useState(() => {
    const draft = localStorage.getItem('DRAFT_CHEAT_DAY');
    return draft === 'true';
  });

  const [pengeluaran, setPengeluaran] = useState(() => {
    const draft = localStorage.getItem('DRAFT_PENGELUARAN');
    return draft ? JSON.parse(draft) : [];
  });

  const [tanggalSesi, setTanggalSesi] = useState(() => {
    const draft = localStorage.getItem('DRAFT_TANGGAL');
    if (draft) return draft;
    // Bawaan hari ini jika tidak ada draft
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().split('T')[0];
  });

  const [isSaving, setIsSaving] = useState(false);

  // --- EFEK SAMPING: SIMPAN DRAFT OTOMATIS ---
  // Setiap kali Anda mengetik, React diam-diam menyimpan ini ke HP Anda
  useEffect(() => {
    localStorage.setItem('DRAFT_COWOK', urunanCowok);
    localStorage.setItem('DRAFT_CEWEK', urunanCewek);
    localStorage.setItem('DRAFT_CHEAT_DAY', isCheatDay);
    localStorage.setItem('DRAFT_PENGELUARAN', JSON.stringify(pengeluaran));
    localStorage.setItem('DRAFT_TANGGAL', tanggalSesi);
  }, [urunanCowok, urunanCewek, isCheatDay, pengeluaran, tanggalSesi]);


  // --- 3. DERIVED STATE ---
  const totalUrunan = urunanCowok + urunanCewek;
  const totalPengeluaran = pengeluaran.reduce((total, item) => total + item.harga, 0);
  
  const sisaHariIni = isCheatDay 
    ? (saldoEndapan + totalUrunan) - totalPengeluaran 
    : totalUrunan - totalPengeluaran;

  const proyeksiSaldoAkhir = isCheatDay ? sisaHariIni : saldoEndapan + sisaHariIni;

  const ringkasanKategori = pengeluaran.reduce((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = 0;
    acc[item.kategori] += item.harga;
    return acc;
  }, {});

  // --- 4. FUNGSI AKSI ---
  const handleTambahPengeluaran = (itemBaru) => {
    setPengeluaran([...pengeluaran, itemBaru]);
  };

  const handleHapusPengeluaranLokal = (idItemYangMauDihapus) => {
    const pengeluaranBaru = pengeluaran.filter(item => item.id !== idItemYangMauDihapus);
    setPengeluaran(pengeluaranBaru);
  };

  const handleTutupSesi = async () => {
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

      // --- (BARU) MENGUNCI LAYAR DENGAN LOADING ---
      Swal.fire({
        title: 'Menyimpan Data...',
        html: 'Sedang mengirim data ke server Google.<br/><b>Jangan tutup halaman ini.</b>',
        allowOutsideClick: false,
        showConfirmButton: false, // Hilangkan tombol OK selama loading
        didOpen: () => {
          Swal.showLoading(); // Putar animasi loading
        }
      });

      const payloadData = {
        action: "simpan",
        idSesi: idSesiUnik,
        tanggalSesi: tanggalSesi,
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
          body: JSON.stringify(payloadData),
          redirect: "follow"
        });

        const result = await response.json();

        if (result.status === "sukses") {
          setSaldoEndapan(proyeksiSaldoAkhir);
          setUrunanCowok(0);
          setUrunanCewek(0);
          setPengeluaran([]);
          setIsCheatDay(false);
          
          localStorage.removeItem('DRAFT_COWOK');
          localStorage.removeItem('DRAFT_CEWEK');
          localStorage.removeItem('DRAFT_CHEAT_DAY');
          localStorage.removeItem('DRAFT_PENGELUARAN');
          localStorage.removeItem('DRAFT_TANGGAL');

          // (DIUBAH) Loading sukses akan menimpa animasi loading sebelumnya
          Swal.fire('Berhasil!', 'Data kencan berhasil disimpan ke Database.', 'success');
        } else {
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
  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h1>Dana Kencan 💸</h1>
        
        {/* (DIUBAH) Memecah tombol menjadi dua baris/kolom kecil agar muat */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => navigate('/statistik')}
            className="btn" 
            style={{ backgroundColor: '#2b50c7', color: 'white', padding: '8px 10px', fontSize: '14px' }}
          >
            📊 Stat
          </button>
          <button 
            onClick={() => navigate('/riwayat')}
            className="btn" 
            style={{ backgroundColor: '#4b5563', color: 'white', padding: '8px 10px', fontSize: '14px' }}
          >
            📄 Riwayat
          </button>
        </div>
      </div>

      {/* KARTU ENDAPAN GLOBAL */}
      <div className="card-highlight">
        <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: 0 }}>Total Saldo Endapan Saat Ini</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          {/* (DIUBAH) Menggunakan className teks-saldo */}
          <div className="teks-saldo">
            {isLoadingSaldo 
                ? '⏳loading...' 
              : showSaldo 
                ? `Rp ${saldoEndapan.toLocaleString('id-ID')}` 
                : 'Rp ••••••'
            }
          </div>
          <button 
            onClick={() => setShowSaldo(!showSaldo)}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', opacity: 0.8 }}
            title={showSaldo ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          >
            {showSaldo ? '👁️' : '🙈'}
          </button>
        </div>
      </div>
      
      <UrunanCard 
        isCheatDay={isCheatDay} setIsCheatDay={setIsCheatDay}
        urunanCowok={urunanCowok} setUrunanCowok={setUrunanCowok}
        urunanCewek={urunanCewek} setUrunanCewek={setUrunanCewek}
        tanggalSesi={tanggalSesi} setTanggalSesi={setTanggalSesi}
      />

      <PengeluaranCard 
        pengeluaran={pengeluaran} 
        onTambahPengeluaran={handleTambahPengeluaran} 
        onHapusPengeluaran={handleHapusPengeluaranLokal}
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