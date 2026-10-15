// src/components/RingkasanCard.jsx

export default function RingkasanCard({
  totalUrunan, totalPengeluaran, sisaHariIni, proyeksiSaldoAkhir,
  isCheatDay, saldoEndapan, ringkasanKategori, onTutupSesi, isSaving
}) {
  return (
    <div className="card-dark">
      <h2>3. Ringkasan Hari Ini</h2>
      
      {/* PERSENTASE */}
      {totalPengeluaran > 0 && (
        <div style={{ marginTop: '15px', marginBottom: '15px', padding: '15px', backgroundColor: '#374151', borderRadius: '8px' }}>
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

      {/* TAMPILAN BERDASARKAN MODE */}
      {isCheatDay ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#fcd34d' }}>
            <span>Total Dana (Urunan + Endapan):</span>
            <span>Rp {(totalUrunan + saldoEndapan).toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#fca5a5' }}>
            <span>Total Pengeluaran:</span>
            <span>- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
          </div>
          <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: proyeksiSaldoAkhir < 0 ? '#fca5a5' : '#34d399' }}>
            <span>Proyeksi Saldo Akhir:</span>
            <span>Rp {proyeksiSaldoAkhir.toLocaleString('id-ID')}</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>Total Urunan:</span>
            <span>Rp {totalUrunan.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#fca5a5' }}>
            <span>Total Pengeluaran:</span>
            <span>- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
          </div>
          <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: sisaHariIni < 0 ? '#fca5a5' : '#34d399' }}>
            <span>{sisaHariIni < 0 ? 'Defisit Hari Ini:' : 'Sisa (Masuk Endapan):'}</span>
            <span>Rp {sisaHariIni.toLocaleString('id-ID')}</span>
          </div>
        </>
      )}
      
      {/* PERINGATAN */}
      {!isCheatDay && sisaHariIni < 0 && (
        <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '14px' }}>
          ⚠️ <strong>Perhatian:</strong> Pengeluaran melebihi urunan. Defisit memotong Endapan.
        </div>
      )}
      {proyeksiSaldoAkhir < 0 && (
        <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '8px', fontSize: '14px' }}>
          ❌ <strong>BAHAYA:</strong> Uang gabungan minus! Anda berutang!
        </div>
      )}

      {/* TOMBOL TUTUP SESI */}
      <button 
        onClick={onTutupSesi}
        disabled={isSaving}
        className="btn"
        style={{ 
          width: '100%', 
          marginTop: '20px', 
          backgroundColor: isSaving ? '#6ee7b7' : '#10b981', 
          color: 'white',
          cursor: isSaving ? 'not-allowed' : 'pointer'
        }}
      >
        {isSaving ? '⏳ Menyimpan ke Database...' : 'Tutup Sesi & Simpan'}
      </button>
    </div>
  );
}