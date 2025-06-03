import { useState, useEffect } from 'react'

const emptyEntry = {
  date: '',
  pnl: '',
  trades: '',
  wins: '',
  notes: '',
  screenshots: []
}

function App() {
  const [entry, setEntry] = useState(emptyEntry)
  const [entries, setEntries] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('entries') || '[]')
    setEntries(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries))
  }, [entries])

  const handleFiles = (files) => {
    const arr = []
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        arr.push(e.target.result)
        if (arr.length === files.length) {
          setEntry((en) => ({ ...en, screenshots: arr }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const addEntry = () => {
    if (!entry.date || entry.pnl === '' || entry.trades === '') return
    const winrate = entry.wins
      ? Math.round((Number(entry.wins) / Number(entry.trades)) * 100)
      : ''
    const newEntry = { ...entry, winrate, id: Date.now() }
    setEntries([newEntry, ...entries])
    setEntry(emptyEntry)
    setMessage('Zapisano!')
    setTimeout(() => setMessage(''), 1500)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'topTickBackup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container">
      <h1>TopTick Trading Notes</h1>
      <div className="form card">
        <input
          type="date"
          value={entry.date}
          onChange={(e) => setEntry({ ...entry, date: e.target.value })}
        />
        <input
          type="number"
          placeholder="P&L"
          value={entry.pnl}
          onChange={(e) => setEntry({ ...entry, pnl: e.target.value })}
        />
        <input
          type="number"
          placeholder="Trades"
          value={entry.trades}
          onChange={(e) => setEntry({ ...entry, trades: e.target.value })}
        />
        <input
          type="number"
          placeholder="Wins"
          value={entry.wins}
          onChange={(e) => setEntry({ ...entry, wins: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          value={entry.notes}
          onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
        ></textarea>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button onClick={addEntry}>Save</button>
        <button onClick={exportData}>Export</button>
        {message && <div className="msg">{message}</div>}
      </div>
      <ul className="entries">
        {entries.map((e) => (
          <li key={e.id} className="card">
            <div className="row header" style={{ borderColor: e.pnl >= 0 ? '#4ade80' : '#f87171' }}>
              <strong>{e.date}</strong>
              <span className={e.pnl >= 0 ? 'green' : 'red'}>{e.pnl}</span>
              <span>{e.trades} trades</span>
              {e.winrate !== '' && <span>{e.winrate}% WR</span>}
            </div>
            {e.notes && <p>{e.notes}</p>}
            {e.screenshots?.length > 0 && (
              <div className="shots">
                {e.screenshots.map((src, i) => (
                  <img key={i} src={src} alt="shot" />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
