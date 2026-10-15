// src/pages/Riwayat.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Riwayat() {
  const navigate = useNavigate();
  
  const [dataRiwayat, setDataRiwayat] = useState([]);
  const [dataDetail, setDataDetail] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); 
  const [sesiTerpilih, setSesiTerpilih] = useState(null);

  // --- (BARU) STATE UNTUK FILTER & PENCARIAN ---
  const [kataKunci, setKataKunci] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL);
        const result = await response.json();
        
        if (result.status === "sukses") {
          setDataRiwayat(result.data.reverse());
          setDataDetail(result.detail || []); 
        } else {
          setError(result.pesan);
        }
      } catch (err) {
        setError("Gagal terhubung ke server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

    const handleHapus = async (idSesi) => {
    // (DIUBAH) Peringatan Hapus yang elegan
    const konfirmasi = await Swal.fire({
      title: 'Yakin ingin menghapus?',
      text: "Data yang dihapus dari Database tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus Permanen!'
    });

    if (!konfirmasi.isConfirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "delete", idSesi: idSesi })
      });
      const result = await response.json();
      
      if (result.status === "sukses") {
        setDataRiwayat(prev => prev.filter(item => item['ID Sesi'] !== idSesi));
        setDataDetail(prev => prev.filter(item => item['ID Sesi'] !== idSesi));
        Swal.fire('Terhapus!', 'Data berhasil dihilangkan dari Database.', 'success');
      } else {
        Swal.fire('Gagal', 'Tidak bisa menghapus: ' + result.pesan, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLihatDetail = (idSesi) => {
    const barangDiSesiIni = dataDetail.filter(item => item['ID Sesi'] === idSesi);
    setSesiTerpilih({ id: idSesi, daftarBarang: barangDiSesiIni });
  };

  const handleCetakPDF = () => window.print();

  // --- (BARU) DERIVED STATE: LOGIKA FILTERING ---
  const dataTampil = dataRiwayat.filter(baris => {
    // 1. Filter Tanggal
    let masukFilterTanggal = true;
    if (tanggalMulai && tanggalAkhir && baris['Tanggal']) {
      const tglBaris = new Date(baris['Tanggal']).setHours(0,0,0,0);
      const tglMulai = new Date(tanggalMulai).setHours(0,0,0,0);
      const tglAkhir = new Date(tanggalAkhir).setHours(23,59,59,999);
      masukFilterTanggal = tglBaris >= tglMulai && tglBaris <= tglAkhir;
    }

    // 2. Filter Pencarian Teks (Bisa cari dari nama barang juga)
    let masukFilterKataKunci = true;
    if (kataKunci) {
      const keyword = kataKunci.toLowerCase();
      const mode = (baris['Mode Cheat Day'] === 'Ya' ? 'cheat day' : 'normal');
      
      // Ambil nama semua barang di sesi ini untuk ikut dicari
      const barangSesiIni = dataDetail.filter(d => d['ID Sesi'] === baris['ID Sesi']);
      const textBarang = barangSesiIni.map(b => `${b['Nama Barang']} ${b['Kategori']}`).join(" ").toLowerCase();

      masukFilterKataKunci = mode.includes(keyword) || textBarang.includes(keyword);
    }

    return masukFilterTanggal && masukFilterKataKunci;
  });

  return (
    <div className="app-container">
      {/* HEADER NAVIGASI */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
          ⬅ Kembali
        </button>
        <button onClick={handleCetakPDF} className="btn btn-primary">
          🖨️ Cetak PDF
        </button>
      </div>

      {/* --- POP-UP (MODAL) DETAIL STRUK --- */}
      {sesiTerpilih && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto', marginTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #d1d5db', paddingBottom: '10px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>🧾 Detail Struk Belanja</h3>
              <button onClick={() => setSesiTerpilih(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>❌</button>
            </div>
            {sesiTerpilih.daftarBarang.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Tidak ada detail pengeluaran.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {sesiTerpilih.daftarBarang.map((barang, index) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{barang['Nama Barang']}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{barang['Kategori']}</div>
                    </div>
                    <span style={{ fontWeight: '500' }}>Rp {Number(barang['Harga']).toLocaleString('id-ID')}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setSesiTerpilih(null)} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>Tutup</button>
          </div>
        </div>
      )}

      {/* --- KOTAK FILTER & PENCARIAN --- */}
      <div className="card no-print" style={{ marginBottom: '20px', backgroundColor: '#f9fafb' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>🔍 Filter Laporan</h3>
        <div className="flex-row flex-row-mobile-col">
          <input 
            type="text" 
            placeholder="Cari nama barang atau mode..." 
            className="input-field" 
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            style={{ flex: 2 }}
          />
          <div style={{ display: 'flex', gap: '10px', flex: 2 }}>
            <input 
              type="date" 
              className="input-field" 
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
            />
            <input 
              type="date" 
              className="input-field" 
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="card" style={{ marginTop: '0' }}>
        <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Laporan Riwayat Sesi</h2>

        {/* Info filter aktif saat PDF dicetak */}
        <div style={{ display: 'none' }} className="print-only">
          <p>Filter: {tanggalMulai && tanggalAkhir ? `${tanggalMulai} s/d ${tanggalAkhir}` : 'Semua Waktu'}</p>
        </div>

        {isLoading && <p style={{ textAlign: 'center' }}>⏳ Memuat data...</p>}
        {error && <p style={{ textAlign: 'center', color: '#dc2626' }}>❌ {error}</p>}
        
        {!isLoading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tanggal</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Mode</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total Pengeluaran</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Sisa / Defisit</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Saldo Akhir</th>
                  <th className="no-print" style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataTampil.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Data tidak ditemukan.</td>
                  </tr>
                ) : (
                  dataTampil.map((baris, index) => {
                    const tanggalRapi = baris['Tanggal'] ? new Date(baris['Tanggal']).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                    const idBarisIni = baris['ID Sesi'];

                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>{tanggalRapi}</td>
                        <td style={{ padding: '12px' }}>{baris['Mode Cheat Day'] === 'Ya' ? '👑 Cheat' : 'Normal'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>Rp {Number(baris['Total Pengeluaran']).toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>Rp {Number(baris['Sisa Hari Ini']).toLocaleString('id-ID')}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Rp {Number(baris['Saldo Endapan Akhir']).toLocaleString('id-ID')}</td>
                        <td className="no-print" style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button onClick={() => handleLihatDetail(idBarisIni)} disabled={!idBarisIni || isDeleting} className="btn" style={{ backgroundColor: (!idBarisIni) ? '#9ca3af' : '#2563eb', color: 'white', padding: '6px 10px', fontSize: '12px', cursor: (!idBarisIni) ? 'not-allowed' : 'pointer' }}>👁️ Lihat</button>
                          <button onClick={() => handleHapus(idBarisIni)} disabled={!idBarisIni || isDeleting} className="btn" style={{ backgroundColor: (!idBarisIni || isDeleting) ? '#fca5a5' : '#ef4444', color: 'white', padding: '6px 10px', fontSize: '12px', cursor: (!idBarisIni || isDeleting) ? 'not-allowed' : 'pointer' }}>🗑️ Hapus</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { background-color: white; margin: 0; padding: 20px; }
          .no-print { display: none !important; }
          .card { box-shadow: none; padding: 0; }
          .print-only { display: block !important; margin-bottom: 20px; font-weight: bold; }
        }
        .print-only { display: none; }
      `}</style>
    </div>
  );
}