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
    const konfirmasi = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    });
    if (!konfirmasi.isConfirmed) return;

    setIsDeleting(true);
    Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "delete", idSesi: idSesi }),
        redirect: "follow"
      });
      const result = await response.json();
      if (result.status === "sukses") {
        setDataRiwayat(prev => prev.filter(item => item['ID Sesi'] !== idSesi));
        setDataDetail(prev => prev.filter(item => item['ID Sesi'] !== idSesi));
        Swal.fire('Terhapus!', 'Data berhasil dihilangkan.', 'success');
      } else {
        Swal.fire('Gagal!', result.pesan, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Kesalahan jaringan.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLihatDetail = (idSesi) => {
    const barangDiSesiIni = dataDetail.filter(item => item['ID Sesi'] === idSesi);
    // Mencari info baris sesi ini untuk dimunculkan di kop struk
    const infoSesi = dataRiwayat.find(item => item['ID Sesi'] === idSesi);
    setSesiTerpilih({ id: idSesi, daftarBarang: barangDiSesiIni, info: infoSesi });
  };

  const handleCetakPDF = () => window.print();

  const dataTampil = dataRiwayat.filter(baris => {
    let masukFilterTanggal = true;
    if (tanggalMulai && tanggalAkhir && baris['Tanggal']) {
      const tglBaris = new Date(baris['Tanggal']).setHours(0,0,0,0);
      const tglMulai = new Date(tanggalMulai).setHours(0,0,0,0);
      const tglAkhir = new Date(tanggalAkhir).setHours(23,59,59,999);
      masukFilterTanggal = tglBaris >= tglMulai && tglBaris <= tglAkhir;
    }
    let masukFilterKataKunci = true;
    if (kataKunci) {
      const keyword = kataKunci.toLowerCase();
      const mode = (baris['Mode Cheat Day'] === 'Ya' ? 'cheat day' : 'normal');
      const barangSesiIni = dataDetail.filter(d => d['ID Sesi'] === baris['ID Sesi']);
      const textBarang = barangSesiIni.map(b => `${b['Nama Barang']} ${b['Kategori']}`).join(" ").toLowerCase();
      masukFilterKataKunci = mode.includes(keyword) || textBarang.includes(keyword);
    }
    return masukFilterTanggal && masukFilterKataKunci;
  });

  return (
    /* Menambahkan kelas khusus jika modal terbuka, agar PDF tahu apa yang harus dicetak */
    <div className={`app-container ${sesiTerpilih ? 'modal-terbuka' : ''}`}>
      
      {/* HEADER NAVIGASI */}
      <div className="no-print laporan-utama" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
          ⬅ Kembali
        </button>
        <button onClick={handleCetakPDF} className="btn btn-primary" style={{ backgroundColor: '#2b50c7' }}>
          🖨️ Cetak Rekap PDF
        </button>
      </div>

      {/* --- KOTAK FILTER & PENCARIAN --- */}
      <div className="card no-print laporan-utama" style={{ marginBottom: '20px', backgroundColor: '#f9fafb' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>🔍 Cari & Filter</h3>
        <div className="flex-row flex-row-mobile-col">
          <input 
            type="text" 
            placeholder="Cari nama barang atau mode..." 
            className="input-field" 
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
          />
          {/* (DIUBAH) Pastikan ada className flex-row-mobile-col di sini */}
          <div className="flex-row flex-row-mobile-col" style={{ width: '100%' }}>
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

      {/* --- TABEL LAPORAN (RESPONSIF) --- */}
      <div className="card laporan-utama" style={{ marginTop: '0' }}>
        <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Laporan Riwayat Sesi</h2>

        <div style={{ display: 'none' }} className="print-only">
          <h3 style={{ textAlign: 'center', margin: '0 0 10px' }}>DANAKENCAN-KU</h3>
          <p style={{ textAlign: 'center', margin: '0 0 20px', borderBottom: '1px dashed black', paddingBottom: '10px' }}>
            Rekap Transaksi: {tanggalMulai && tanggalAkhir ? `${tanggalMulai} s/d ${tanggalAkhir}` : 'Semua Waktu'}
          </p>
        </div>

        {isLoading && <p style={{ textAlign: 'center' }}>⏳ Memuat data dari server...</p>}
        {error && <p style={{ textAlign: 'center', color: '#dc2626' }}>❌ {error}</p>}
        
        {!isLoading && !error && (
          // (DIUBAH) Menghilangkan div overflow agar efek card mobile bekerja
          <div>
            <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tanggal</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Mode</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Pengeluaran</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Sisa/Defisit</th>
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
                      // (DIUBAH) Menambahkan data-label untuk setiap TD agar tampil sebagai kartu di HP
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td data-label="Tanggal :" style={{ padding: '12px' }}>{tanggalRapi}</td>
                        <td data-label="Mode :" style={{ padding: '12px' }}>{baris['Mode Cheat Day'] === 'Ya' ? '👑 Cheat' : 'Normal'}</td>
                        <td data-label="Total Keluar :" style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>Rp {Number(baris['Total Pengeluaran']).toLocaleString('id-ID')}</td>
                        <td data-label="Sisa Harian :" style={{ padding: '12px', textAlign: 'right' }}>Rp {Number(baris['Sisa Hari Ini']).toLocaleString('id-ID')}</td>
                        <td data-label="Saldo Akhir :" style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Rp {Number(baris['Saldo Endapan Akhir']).toLocaleString('id-ID')}</td>
                        
                        <td className="no-print aksi-buttons" style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button onClick={() => handleLihatDetail(idBarisIni)} disabled={!idBarisIni || isDeleting} className="btn" style={{ backgroundColor: (!idBarisIni) ? '#9ca3af' : '#2563eb', color: 'white', padding: '6px 12px', fontSize: '12px', flex: 1 }}>👁️ Struk</button>
                          <button onClick={() => handleHapus(idBarisIni)} disabled={!idBarisIni || isDeleting} className="btn" style={{ backgroundColor: (!idBarisIni || isDeleting) ? '#fca5a5' : '#ef4444', color: 'white', padding: '6px 12px', fontSize: '12px', flex: 1 }}>🗑️ Hapus</button>
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

      {/* --- POP-UP MODAL (STRUK KASIR) --- */}
      {sesiTerpilih && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="card modal-content" style={{ width: '100%', maxWidth: '350px', maxHeight: '80vh', overflowY: 'auto', marginTop: 0, backgroundColor: 'white' }}>
            
            <div className="struk-header" style={{ textAlign: 'center', borderBottom: '2px dashed #d1d5db', paddingBottom: '15px', marginBottom: '15px' }}>
              <img src="/logo-danakencan.jpg" alt="Logo" className="print-only-img" style={{ width: '60px', borderRadius: '8px', marginBottom: '10px' }} />
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>DANAKENCAN-KU</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Tanggal: {new Date(sesiTerpilih.info['Tanggal']).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6b7280' }}>ID: {sesiTerpilih.id}</p>
            </div>

            <div style={{ marginBottom: '15px' }}>
              {sesiTerpilih.daftarBarang.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Tidak ada detail barang.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sesiTerpilih.daftarBarang.map((barang, index) => (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px' }}>
                      <div style={{ width: '60%' }}>
                        <div style={{ color: '#1f2937' }}>{barang['Nama Barang']}</div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>{barang['Kategori']}</div>
                      </div>
                      <span style={{ fontWeight: '500', textAlign: 'right' }}>
                        {Number(barang['Harga']).toLocaleString('id-ID')}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ borderTop: '2px dashed #d1d5db', paddingTop: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Total Urunan:</span>
                <span>{Number(sesiTerpilih.info['Urunan Cowok'] + sesiTerpilih.info['Urunan Cewek']).toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
                <span>Total Belanja:</span>
                <span>{Number(sesiTerpilih.info['Total Pengeluaran']).toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#6b7280', fontSize: '12px' }}>
                <span>Saldo Endapan Akhir:</span>
                <span>Rp {Number(sesiTerpilih.info['Saldo Endapan Akhir']).toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button onClick={() => setSesiTerpilih(null)} className="btn" style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151' }}>Tutup</button>
              <button onClick={handleCetakPDF} className="btn btn-primary" style={{ flex: 1, backgroundColor: '#2b50c7' }}>🖨️ Cetak Struk</button>
            </div>
          </div>
        </div>
      )}

      {/* --- KEAJAIBAN CSS: TABEL MOBILE & PDF THERMAL PRINTER --- */}
      <style>{`
        /* 1. TAMPILAN KARTU DI MOBILE (Responsif) */
        @media (max-width: 600px) {
          .responsive-table thead { display: none; }
          .responsive-table, .responsive-table tbody, .responsive-table tr, .responsive-table td { display: block; width: 100%; }
          .responsive-table tr { 
            margin-bottom: 15px; background-color: white; border: 1px solid #e5e7eb; 
            border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); 
          }
          .responsive-table td { 
            display: flex; justify-content: space-between; align-items: center; 
            text-align: right; border-bottom: 1px solid #f3f4f6; padding: 10px 0; 
          }
          .responsive-table td:last-child { border-bottom: none; padding-bottom: 0; }
          .responsive-table td::before { 
            content: attr(data-label); font-weight: normal; color: #6b7280; text-align: left; 
          }
        }

        /* 2. TAMPILAN KERTAS THERMAL PRINTER (PDF) */
        @media print {
          @page { margin: 0; size: 80mm auto; } /* Memaksa ukuran kertas struk kasir 80mm */
          body { 
            background-color: white; margin: 0; padding: 5mm; 
            font-family: 'Courier New', Courier, monospace; /* Font khas mesin kasir */
            font-size: 11px; color: black; 
          }
          .no-print { display: none !important; }
          .card { box-shadow: none; border: none; padding: 0; margin: 0; }
          .print-only { display: block !important; }
          .print-only-img { display: inline-block !important; }

          /* Trik Cerdas: Jika Modal Struk Sedang Terbuka, PDF Hanya Mencetak Modal Saja */
          .modal-terbuka .laporan-utama { display: none !important; }
          .modal-terbuka .modal-overlay { position: static !important; background: white !important; padding: 0 !important; }
          .modal-terbuka .modal-content { max-width: 100% !important; max-height: none !important; overflow: visible !important; }

          /* Mengubah Tabel Riwayat menjadi Format Struk jika dicetak utuh */
          .responsive-table th, .responsive-table td { 
            font-size: 10px; padding: 4px 2px !important; border-bottom: 1px dashed black !important; 
          }
          .responsive-table thead tr { border-bottom: 2px dashed black !important; }
        }
        .print-only, .print-only-img { display: none; }
      `}</style>
    </div>
  );
}