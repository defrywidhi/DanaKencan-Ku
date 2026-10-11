// src/components/PengeluaranCard.jsx
import { useState } from 'react';

const DAFTAR_KATEGORI = ["Makan Besar", "Jajan", "Transportasi", "Parkir", "Hiburan", "Lainnya"];

export default function PengeluaranCard({ pengeluaran, onTambahPengeluaran }) {
  // STATE LOKAL: Hanya digunakan di dalam form ini saja
  const [namaBarang, setNamaBarang] = useState('');
  const [hargaBarang, setHargaBarang] = useState('');
  const [kategoriBarang, setKategoriBarang] = useState(DAFTAR_KATEGORI[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaBarang || !hargaBarang) return;

    // Panggil fungsi dari App.jsx untuk menyimpan data
    onTambahPengeluaran({
      id: Date.now(),
      nama: namaBarang,
      harga: Number(hargaBarang),
      kategori: kategoriBarang
    });

    // Reset form
    setNamaBarang('');
    setHargaBarang('');
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>2. Daftar Pengeluaran</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Nama Barang" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} style={{ flex: 2, padding: '8px' }} />
          <select value={kategoriBarang} onChange={(e) => setKategoriBarang(e.target.value)} style={{ flex: 1, padding: '8px' }}>
            {DAFTAR_KATEGORI.map(kat => (
              <option key={kat} value={kat}>{kat}</option>
            ))}
          </select>
        </div>
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
  );
}