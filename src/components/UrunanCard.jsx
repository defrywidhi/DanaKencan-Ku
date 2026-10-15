// src/components/UrunanCard.jsx

// (DIUBAH) Menerima props tanggalSesi dan setTanggalSesi
export default function UrunanCard({ 
  isCheatDay, setIsCheatDay, 
  urunanCowok, setUrunanCowok, 
  urunanCewek, setUrunanCewek,
  tanggalSesi, setTanggalSesi 
}) {
  
  const formatRp = (angka) => angka === 0 || !angka ? '' : angka.toLocaleString('id-ID');
  const parseRp = (teks) => Number(teks.replace(/[^0-9]/g, ''));

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>1. Urunan Hari Ini</h2>
        
        {/* (BARU) INPUT TANGGAL DI POJOK KANAN ATAS KARTU */}
        <div>
          <input 
            type="date" 
            className="input-field" 
            value={tanggalSesi}
            onChange={(e) => setTanggalSesi(e.target.value)}
            style={{ marginTop: 0, padding: '8px', fontSize: '14px', width: 'auto' }}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '15px', padding: '12px', backgroundColor: isCheatDay ? '#fef08a' : '#f3f4f6', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <input type="checkbox" checked={isCheatDay} onChange={(e) => setIsCheatDay(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          👑 Aktifkan Mode Cheat Day
        </label>
      </div>

      <div className="flex-row flex-row-mobile-col" style={{ marginTop: '15px' }}>
        <div style={{ flex: 1 }}>
          <label>Cowok (Rp):</label>
          <input 
            type="text" 
            inputMode="numeric"
            className="input-field"
            value={formatRp(urunanCowok)} 
            onChange={(e) => setUrunanCowok(parseRp(e.target.value))} 
            placeholder="0"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Cewek (Rp):</label>
          <input 
            type="text" 
            inputMode="numeric"
            className="input-field"
            value={formatRp(urunanCewek)} 
            onChange={(e) => setUrunanCewek(parseRp(e.target.value))} 
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}