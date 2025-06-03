import { useState, useEffect } from 'react'

const emptyEntry = { date: '', pnl: '', trades: '', winrate: '', notes: '' }

function App() {
  const [entry, setEntry] = useState(emptyEntry)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('entries') || '[]')
    setEntries(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries))
  }, [entries])

  const addEntry = () => {
    if (!entry.date || entry.pnl === '' || entry.trades === '') return
    setEntries([{ ...entry, id: Date.now() }, ...entries])
    setEntry(emptyEntry)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
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
      <div className="form">
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
          placeholder="Winrate %"
          value={entry.winrate}
          onChange={(e) => setEntry({ ...entry, winrate: e.target.value })}
        />
        <textarea
          placeholder="Notes"
          value={entry.notes}
          onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
        ></textarea>
        <button onClick={addEntry}>Save</button>
        <button onClick={exportData}>Export</button>
      </div>
      <ul className="entries">
        {entries.map((e) => (
          <li key={e.id}>
            <div className="row">
              <strong>{e.date}</strong>
              <span>P&L: {e.pnl}</span>
              <span>Trades: {e.trades}</span>
              {e.winrate && <span>Winrate: {e.winrate}%</span>}
            </div>
            {e.notes && <p>{e.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
