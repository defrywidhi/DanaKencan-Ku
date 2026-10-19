// src/pages/Statistik.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WARNA_KATEGORI = ['#2b50c7', '#f43f5e', '#f97316', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export default function Statistik() {
  const navigate = useNavigate();
  const [dataGrafik, setDataGrafik] = useState([]);
  const [totalSemua, setTotalSemua] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kataKunci, setKataKunci] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' });
  const [kategoriTerpilih, setKategoriTerpilih] = useState(null);

  // --- (BARU) STATE UNTUK PENGURUTAN DI DALAM POP-UP ---
  const [sortRincian, setSortRincian] = useState('tanggal-desc');

  useEffect(() => {
    const fetchStatistik = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL);
        const result = await response.json();
        
        if (result.status === "sukses" && result.detail) {
          let total = 0;
          const rekapKategori = result.detail.reduce((acc, barang) => {
            const kategori = barang['Kategori'];
            const harga = Number(barang['Harga']);
            
            if (!acc[kategori]) acc[kategori] = { totalUang: 0, daftarBarang: [] };
            
            acc[kategori].totalUang += harga;
            acc[kategori].daftarBarang.push(barang);
            total += harga;
            return acc;
          }, {});

          const formatGrafik = Object.keys(rekapKategori).map(kategori => {
            const nominal = rekapKategori[kategori].totalUang;
            return {
              name: kategori,
              value: nominal,
              persentase: total > 0 ? Number(((nominal / total) * 100).toFixed(1)) : 0,
              items: rekapKategori[kategori].daftarBarang // Tidak diurutkan di sini, karena akan diurutkan dinamis nanti
            };
          });

          formatGrafik.sort((a, b) => b.value - a.value);
          setDataGrafik(formatGrafik);
          setTotalSemua(total);
        }
      } catch (err) {
        setError("Gagal menarik data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistik();
  }, []);

  const formatRupiah = (value) => `Rp ${value.toLocaleString('id-ID')}`;

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const dataTabel = [...dataGrafik]
    .filter(item => item.name.toLowerCase().includes(kataKunci.toLowerCase()))
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕️';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  // --- (BARU) DERIVED STATE: Mengurutkan data rincian secara dinamis ---
  const getRincianTampil = () => {
    if (!kategoriTerpilih) return [];
    
    // Copy array agar tidak merusak data asli
    return [...kategoriTerpilih.items].sort((a, b) => {
      const tglA = new Date(a['Tanggal Sesi'] || a['Tanggal']).getTime();
      const tglB = new Date(b['Tanggal Sesi'] || b['Tanggal']).getTime();
      const hargaA = Number(a['Harga']);
      const hargaB = Number(b['Harga']);

      switch (sortRincian) {
        case 'tanggal-desc': return tglB - tglA; // Terbaru
        case 'tanggal-asc': return tglA - tglB;   // Terlama
        case 'harga-desc': return hargaB - hargaA; // Termahal
        case 'harga-asc': return hargaA - hargaB;   // Termurah
        default: return 0;
      }
    });
  };

  const rincianTampil = getRincianTampil();

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
          ⬅ Kembali
        </button>
        <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '20px' }}>📊 Statistik</h2>
      </div>

      {isLoading && <p style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Menganalisa data pengeluaran...</p>}
      {error && <p style={{ textAlign: 'center', color: '#dc2626' }}>❌ {error}</p>}

      {/* --- POP-UP MODAL RINCIAN --- */}
      {kategoriTerpilih && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', marginTop: 0 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px dashed #d1d5db', paddingBottom: '10px', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e3a8a' }}>Rincian: {kategoriTerpilih.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: 'bold' }}>
                  Total: Rp {kategoriTerpilih.value.toLocaleString('id-ID')}
                </p>
              </div>
              <button 
                onClick={() => {
                  setKategoriTerpilih(null);
                  setSortRincian('tanggal-desc'); // Reset sort saat ditutup
                }} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ❌
              </button>
            </div>

            {/* (BARU) Dropdown Pengurutan Rincian */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <select 
                value={sortRincian} 
                onChange={(e) => setSortRincian(e.target.value)}
                className="input-field"
                style={{ padding: '6px', fontSize: '12px', width: 'auto', marginTop: 0 }}
              >
                <option value="tanggal-desc">📅 Terbaru</option>
                <option value="tanggal-asc">📅 Terlama</option>
                <option value="harga-desc">💰 Termahal</option>
                <option value="harga-asc">💰 Termurah</option>
              </select>
            </div>

            {/* Area List (Bisa di-scroll jika panjang) */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '5px' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rincianTampil.map((barang, index) => {
                  const tglMentah = barang['Tanggal Sesi'] || barang['Tanggal'];
                  const tglBeli = tglMentah ? new Date(tglMentah).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                  
                  return (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{barang['Nama Barang']}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>🗓️ {tglBeli}</div>
                      </div>
                      <span style={{ fontWeight: '500', color: '#dc2626' }}>
                        Rp {Number(barang['Harga']).toLocaleString('id-ID')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            <button 
              onClick={() => {
                setKategoriTerpilih(null);
                setSortRincian('tanggal-desc'); // Reset sort saat ditutup
              }} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '15px', backgroundColor: '#2b50c7' }}
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}

      {/* ... (SISA KODE GRAFIK DAN TABEL TETAP SAMA SEPERTI SEBELUMNYA) ... */}
      {!isLoading && !error && dataGrafik.length > 0 && (
        <>
          <div className="card-highlight" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontWeight: 'normal', fontSize: '16px' }}>Total Pengeluaran Keseluruhan</h3>
            <div className="teks-saldo">Rp {totalSemua.toLocaleString('id-ID')}</div>
          </div>

          <div className="card">
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#4b5563' }}>Sebaran Kategori Belanja</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dataGrafik} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" paddingAngle={2}>
                    {dataGrafik.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={WARNA_KATEGORI[index % WARNA_KATEGORI.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#4b5563' }}>Rincian & Analisis Tabel</h3>
            
            <input type="text" placeholder="🔍 Cari kategori..." className="input-field" value={kataKunci} onChange={(e) => setKataKunci(e.target.value)} style={{ marginBottom: '15px' }} />

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db', userSelect: 'none' }}>
                    <th onClick={() => handleSort('name')} style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}>Kategori{getSortIcon('name')}</th>
                    <th onClick={() => handleSort('persentase')} style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}>Porsi{getSortIcon('persentase')}</th>
                    <th onClick={() => handleSort('value')} style={{ padding: '12px', textAlign: 'right', cursor: 'pointer' }}>Total (Rp){getSortIcon('value')}</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTabel.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontWeight: '500', color: '#1e3a8a' }}>{item.name}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          {item.persentase}%
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626', fontWeight: '500' }}>
                        {item.value.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setKategoriTerpilih(item)}
                          className="btn"
                          style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', fontSize: '12px', border: '1px solid #d1d5db' }}
                        >
                          👁️ Rincian
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}