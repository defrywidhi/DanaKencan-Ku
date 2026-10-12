// src/components/RingkasanCard.jsx

export default function RingkasanCard({
  totalUrunan,
  totalPengeluaran,
  sisaHariIni,
  proyeksiSaldoAkhir,
  isCheatDay,
  saldoEndapan,
  ringkasanKategori,
  onTutupSesi,
  isSaving
}) {
  return (
    <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
      <h2>3. Ringkasan Hari Ini</h2>
      
      {/* BAGIAN PERSENTASE KATEGORI */}
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

      {/* --- (DIUBAH) LOGIKA TAMPILAN BERDASARKAN MODE --- */}
      {isCheatDay ? (
        /* TAMPILAN MODE CHEAT DAY */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#fcd34d' }}>
            <span>Total Dana (Urunan + Endapan):</span>
            <span>Rp {(totalUrunan + saldoEndapan).toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#f87171' }}>
            <span>Total Pengeluaran:</span>
            <span>- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
          </div>
          
          <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: proyeksiSaldoAkhir < 0 ? '#f87171' : '#34d399' }}>
            <span>Proyeksi Saldo Akhir:</span>
            <span>Rp {proyeksiSaldoAkhir.toLocaleString('id-ID')}</span>
          </div>
        </>
      ) : (
        /* TAMPILAN MODE NORMAL (Seperti biasa) */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>Total Urunan:</span>
            <span>Rp {totalUrunan.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#f87171' }}>
            <span>Total Pengeluaran:</span>
            <span>- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
          </div>
          
          <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: sisaHariIni < 0 ? '#f87171' : '#34d399' }}>
            <span>{sisaHariIni < 0 ? 'Defisit Hari Ini:' : 'Sisa (Masuk Endapan):'}</span>
            <span>Rp {sisaHariIni.toLocaleString('id-ID')}</span>
          </div>
        </>
      )}
      
      {/* --- LOGIKA PERINGATAN --- */}
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

      {/* TOMBOL TUTUP SESI */}
      <button 
        onClick={onTutupSesi}
        disabled={isSaving}
        style={{ width: '100%', padding: '12px', marginTop: '20px', backgroundColor: isSaving ? '#6ee7b7' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer' }}
      >
        {isSaving ? '⏳ Menyimpan ke Database...' : 'Tutup Sesi & Simpan'}
      </button>
    </div>
  );
}