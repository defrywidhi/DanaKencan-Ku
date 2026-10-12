// src/components/UrunanCard.jsx

export default function UrunanCard({
  isCheatDay, 
  setIsCheatDay, 
  urunanCowok, 
  setUrunanCowok, 
  urunanCewek, 
  setUrunanCewek 
}) {
  return (
    <div className="card">
      <h2>1. Urunan Hari Ini</h2>
      
      <div style={{ marginTop: '15px', padding: '12px', backgroundColor: isCheatDay ? '#fef08a' : '#f3f4f6', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          <input 
            type="checkbox" 
            checked={isCheatDay} 
            onChange={(e) => setIsCheatDay(e.target.checked)} 
            style={{ width: '18px', height: '18px' }} 
          />
          👑 Aktifkan Mode Cheat Day
        </label>
      </div>

      {/* Perhatikan penambahan className="flex-row flex-row-mobile-col" di bawah ini */}
      <div className="flex-row flex-row-mobile-col" style={{ marginTop: '15px' }}>
        <div style={{ flex: 1 }}>
          <label>Cowok (Rp):</label>
          <input 
            type="number" 
            className="input-field"
            value={urunanCowok || ''} 
            onChange={(e) => setUrunanCowok(Number(e.target.value))} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Cewek (Rp):</label>
          <input 
            type="number" 
            className="input-field"
            value={urunanCewek || ''} 
            onChange={(e) => setUrunanCewek(Number(e.target.value))} 
          />
        </div>
      </div>
    </div>
  );
}