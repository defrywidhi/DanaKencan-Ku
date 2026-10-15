// src/components/PengeluaranCard.jsx
import { useState } from 'react';

const DAFTAR_KATEGORI = ["Makan Besar", "Jajan", "Transportasi", "Parkir", "Hiburan", "Lainnya"];

export default function PengeluaranCard({ pengeluaran, onTambahPengeluaran, onHapusPengeluaran }) {
  const [namaBarang, setNamaBarang] = useState('');
  const [hargaBarang, setHargaBarang] = useState('');
  const [kategoriBarang, setKategoriBarang] = useState(DAFTAR_KATEGORI[0]);

  const formatRp = (angka) => angka === 0 || !angka ? '' : angka.toLocaleString('id-ID');
  const parseRp = (teks) => Number(teks.replace(/[^0-9]/g, ''));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!namaBarang || !hargaBarang) return;

    onTambahPengeluaran({
      id: Date.now(),
      nama: namaBarang,
      harga: Number(hargaBarang),
      kategori: kategoriBarang
    });

    setNamaBarang('');
    setHargaBarang('');
  };

  return (
    <div className="card">
      <h2>2. Daftar Pengeluaran</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
        <div className="flex-row flex-row-mobile-col">
          <input type="text" placeholder="Nama Barang" className="input-field" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} style={{ flex: 2 }} />
          <select className="input-field" value={kategoriBarang} onChange={(e) => setKategoriBarang(e.target.value)} style={{ flex: 1 }}>
            {DAFTAR_KATEGORI.map(kat => (
              <option key={kat} value={kat}>{kat}</option>
            ))}
          </select>
        </div>
        <div className="flex-row flex-row-mobile-col">
          <input 
            type="text" 
            inputMode="numeric"
            placeholder="Harga (Rp)" 
            className="input-field"
            value={formatRp(hargaBarang)} 
            onChange={(e) => setHargaBarang(parseRp(e.target.value))} 
            style={{ flex: 2 }} 
          />
          <button type="submit" className="btn btn-primary" style={{ flex: 1, marginTop: '5px' }}>Tambah</button>
        </div>
      </form>

      <ul style={{ marginTop: '20px', listStyle: 'none', padding: 0 }}>
        {pengeluaran.map((item) => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{item.nama}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.kategori}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: '500' }}>Rp {item.harga.toLocaleString('id-ID')}</span>
              <button onClick={() => onHapusPengeluaran(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', padding: '5px' }}>❌</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}