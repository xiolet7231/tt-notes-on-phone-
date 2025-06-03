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
  const [modal, setModal] = useState('')

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('toptick-entries') || '[]')
    setEntries(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('toptick-entries', JSON.stringify(entries))
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

  const winrate = entry.trades
    ? Math.round((Number(entry.wins || 0) / Number(entry.trades)) * 100)
    : 0

  const addEntry = () => {
    if (!entry.date || entry.pnl === '' || entry.trades === '') return
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1f2b] p-4 font-[Inter]">
      <h1 className="text-center text-2xl font-semibold text-white mb-4">
        TopTick Trading Notes
      </h1>
      <div className="max-w-md mx-auto p-6 space-y-4 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
        <input
          type="date"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.date}
          onChange={(e) => setEntry({ ...entry, date: e.target.value })}
        />
        <input
          type="number"
          placeholder="P&L"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.pnl}
          onChange={(e) => setEntry({ ...entry, pnl: e.target.value })}
        />
        <input
          type="number"
          placeholder="Trades"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.trades}
          onChange={(e) => setEntry({ ...entry, trades: e.target.value })}
        />
        <input
          type="number"
          placeholder="Wins"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.wins}
          onChange={(e) => setEntry({ ...entry, wins: e.target.value })}
        />
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">Winrate:</span>
          <span className="min-w-[3rem] text-center">{winrate}%</span>
        </div>
        <textarea
          placeholder="Notes"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.notes}
          onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
        ></textarea>
        <input
          type="file"
          accept="image/*"
          multiple
          className="w-full text-white bg-white/10 rounded-lg py-2 px-3 hover:bg-white/20 transition"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-medium rounded-lg shadow-md hover:from-emerald-600 hover:to-cyan-500 transition"
          onClick={addEntry}
        >
          Save
        </button>
        <button
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-medium rounded-lg shadow-md hover:from-emerald-600 hover:to-cyan-500 transition"
          onClick={exportData}
        >
          Export
        </button>
        {message && <div className="text-center text-emerald-400 fade-in show">{message}</div>}
      </div>
      <div className="mt-8 space-y-6 max-w-md mx-auto">
        {entries.map((e) => (
          <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
              <div className="flex items-center">
                <div className={`w-1 h-8 rounded-full ${e.pnl > 0 ? 'bg-emerald-400' : e.pnl < 0 ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                <span className="ml-3 text-white font-medium">{e.date}</span>
              </div>
              <div className="flex space-x-6">
                <span className={e.pnl >= 0 ? 'font-medium text-emerald-400' : 'font-medium text-red-400'}>${e.pnl}</span>
                <span className="font-medium text-white">{e.trades} trades</span>
                <span className="font-medium text-white">{e.winrate}% WR</span>
              </div>
            </div>
            {(e.notes || e.screenshots.length) && (
              <div className="px-6 py-4">
                {e.notes && <p className="text-gray-200 mb-4">{e.notes}</p>}
                {e.screenshots.length > 0 && (
                  <div className="flex space-x-4 overflow-x-auto">
                    {e.screenshots.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="shot"
                        className="w-20 h-20 rounded-lg cursor-pointer hover:opacity-80 transition"
                        onClick={() => setModal(src)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center" onClick={() => setModal('')}>
          <img src={modal} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
          <button className="absolute top-6 right-6 text-white text-3xl" onClick={() => setModal('')}>&times;</button>
        </div>
      )}
    </div>
  )
}

export default App
