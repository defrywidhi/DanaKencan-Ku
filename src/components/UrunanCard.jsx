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
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>1. Urunan Hari Ini</h2>
      
      <div style={{ marginTop: '15px', padding: '10px', backgroundColor: isCheatDay ? '#fef08a' : '#f3f4f6', borderRadius: '6px' }}>
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

      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label>Cowok (Rp):</label>
          <input 
            type="number" 
            value={urunanCowok || ''} 
            onChange={(e) => setUrunanCowok(Number(e.target.value))} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Cewek (Rp):</label>
          <input 
            type="number" 
            value={urunanCewek || ''} 
            onChange={(e) => setUrunanCewek(Number(e.target.value))} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>
      </div>
    </div>
  );
}