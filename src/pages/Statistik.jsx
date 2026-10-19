// src/pages/Statistik.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const WARNA_KATEGORI = ['#2b50c7', '#f43f5e', '#f97316', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export default function Statistik() {
  const navigate = useNavigate();
  const [dataGrafik, setDataGrafik] = useState([]);
  const [totalSemua, setTotalSemua] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- (BARU) STATE UNTUK TABEL INTERAKTIF ---
  const [kataKunci, setKataKunci] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'value', direction: 'desc' }); // Default: Pengeluaran Terbesar

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
            
            if (!acc[kategori]) acc[kategori] = 0;
            acc[kategori] += harga;
            total += harga;
            return acc;
          }, {});

          // Format ke Array dan hitung persentase sekalian
          const formatGrafik = Object.keys(rekapKategori).map(kategori => {
            const nominal = rekapKategori[kategori];
            return {
              name: kategori,
              value: nominal,
              persentase: total > 0 ? ((nominal / total) * 100).toFixed(1) : 0 // Hitung Persen dengan 1 desimal
            };
          });

          // Urutan default untuk grafik tetap Terbesar -> Terkecil
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

  // --- (BARU) FUNGSI PENGURUTAN TABEL KETIKA HEADER DIKLIK ---
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // --- (BARU) DERIVED STATE: DATA TABEL YANG DIFILTER & DIURUTKAN ---
  const dataTabel = [...dataGrafik]
    // 1. Filter Pencarian
    .filter(item => item.name.toLowerCase().includes(kataKunci.toLowerCase()))
    // 2. Pengurutan (Sorting)
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Helper icon arah panah untuk tabel
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕️';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn" style={{ backgroundColor: '#e5e7eb', color: '#374151' }}>
          ⬅ Kembali
        </button>
        <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '20px' }}>📊 Statistik</h2>
      </div>

      {isLoading && <p style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Menganalisa data pengeluaran...</p>}
      {error && <p style={{ textAlign: 'center', color: '#dc2626' }}>❌ {error}</p>}

      {!isLoading && !error && dataGrafik.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
          Belum ada data pengeluaran untuk dianalisa.
        </div>
      )}

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

          {/* --- (BARU) TABEL INTERAKTIF --- */}
          <div className="card">
            <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#4b5563' }}>Rincian & Analisis Tabel</h3>
            
            {/* Input Filter Pencarian */}
            <input 
              type="text" 
              placeholder="🔍 Cari kategori..." 
              className="input-field" 
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              style={{ marginBottom: '15px' }}
            />

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db', userSelect: 'none' }}>
                    {/* Header Tabel yang bisa diklik untuk sorting */}
                    <th 
                      onClick={() => handleSort('name')} 
                      style={{ padding: '12px', textAlign: 'left', cursor: 'pointer' }}
                    >
                      Kategori{getSortIcon('name')}
                    </th>
                    <th 
                      onClick={() => handleSort('persentase')} 
                      style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}
                    >
                      Persentase{getSortIcon('persentase')}
                    </th>
                    <th 
                      onClick={() => handleSort('value')} 
                      style={{ padding: '12px', textAlign: 'right', cursor: 'pointer' }}
                    >
                      Total (Rp){getSortIcon('value')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataTabel.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                        Kategori tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    dataTabel.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#1e3a8a' }}>{item.name}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{ 
                            backgroundColor: '#e0e7ff', color: '#3730a3', 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' 
                          }}>
                            {item.persentase}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626', fontWeight: '500' }}>
                          {item.value.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </>
      )}
    </div>
  );
}