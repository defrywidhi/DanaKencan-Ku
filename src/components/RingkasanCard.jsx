// src/components/RingkasanCard.jsx

export default function RingkasanCard({
  totalUrunan, totalPengeluaran, sisaHariIni, proyeksiSaldoAkhir,
  isCheatDay, saldoEndapan, ringkasanKategori, onTutupSesi, isSaving
}) {

  // --- LOGIKA KESEHATAN ANGGARAN (BUDGET HEALTH) ---
  const budgetMaksimal = isCheatDay ? totalUrunan + saldoEndapan : totalUrunan;
  
  let persentasePemakaian = 0;
  if (budgetMaksimal > 0) {
    persentasePemakaian = (totalPengeluaran / budgetMaksimal) * 100;
  } else if (totalPengeluaran > 0) {
    persentasePemakaian = 100; // Jika budget 0 tapi ada pengeluaran, otomatis 100% (Bahaya)
  }

  // Membatasi lebar visual maksimal 100% agar bar tidak jebol ke luar layar
  const lebarVisualBar = Math.min(persentasePemakaian, 100);

  // Menentukan warna bilah berdasarkan tingkat pemakaian
  let warnaBar = '#10b981'; // Hijau (Aman, di bawah 50%)
  if (persentasePemakaian >= 85) {
    warnaBar = '#ef4444'; // Merah (Bahaya, 85% ke atas)
  } else if (persentasePemakaian >= 50) {
    warnaBar = '#f59e0b'; // Oranye (Waspada, 50% - 84%)
  }

  return (
    <div className="card-dark">
      <h2 style={{ marginBottom: '15px' }}>3. Ringkasan Hari Ini</h2>
      
      {/* --- (BARU) PROGRESS BAR KESEHATAN ANGGARAN --- */}
      <div style={{ marginBottom: '25px', backgroundColor: '#374151', padding: '15px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
          <span style={{ color: '#9ca3af' }}>Pemakaian Anggaran</span>
          <span style={{ fontWeight: 'bold', color: warnaBar }}>
            {persentasePemakaian.toFixed(1)}% Terpakai
          </span>
        </div>
        
        {/* Latar Belakang Bar (Track) */}
        <div style={{ width: '100%', backgroundColor: '#1f2937', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
          {/* Bar Berwarna (Fill) dengan efek animasi halus */}
          <div style={{ 
            width: `${lebarVisualBar}%`, 
            backgroundColor: warnaBar, 
            height: '100%', 
            transition: 'width 0.5s ease-in-out, background-color 0.5s ease' 
          }}></div>
        </div>
        
        {/* Peringatan kecil jika melebihi 100% */}
        {persentasePemakaian > 100 && (
          <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '5px', textAlign: 'right' }}>
            *Pengeluaran melebihi batas anggaran harian
          </div>
        )}
      </div>

      {/* PERSENTASE KATEGORI */}
      {totalPengeluaran > 0 && (
        <div style={{ marginTop: '15px', marginBottom: '15px', padding: '15px', backgroundColor: '#374151', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#9ca3af' }}>Rincian Kategori:</h3>
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
            <span className="nowrap">Rp {(totalUrunan + saldoEndapan).toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#fca5a5' }}>
            <span>Total Pengeluaran:</span>
            <span className="nowrap">- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
          </div>
          <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', color: proyeksiSaldoAkhir < 0 ? '#fca5a5' : '#34d399' }}>
            <span style={{ marginRight: '10px' }}>Proyeksi Saldo Akhir:</span>
            <span className="nowrap">Rp {proyeksiSaldoAkhir.toLocaleString('id-ID')}</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span>Total Urunan:</span>
            <span className="nowrap">Rp {totalUrunan.toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#fca5a5' }}>
            <span>Total Pengeluaran:</span>
            <span className="nowrap">- Rp {totalPengeluaran.toLocaleString('id-ID')}</span>
          </div>
          <hr style={{ margin: '15px 0', borderColor: '#4b5563' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', color: sisaHariIni < 0 ? '#fca5a5' : '#34d399' }}>
            <span style={{ marginRight: '10px', lineHeight: '1.2' }}>{sisaHariIni < 0 ? 'Defisit Hari Ini:' : 'Sisa (Masuk Endapan):'}</span>
            <span className="nowrap">Rp {sisaHariIni.toLocaleString('id-ID')}</span>
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