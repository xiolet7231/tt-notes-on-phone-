import { useState, useEffect, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'
import JSZip from 'jszip'

const emptyEntry = {
  date: '',
  price: '',
  levelType: 'red',
  status: 'pending',
  notes: '',
  tags: '',
  screenshots: []
}

const levelTypeColors = {
  red: 'bg-red-500 text-white',
  orange: 'bg-orange-400 text-white',
}
const statusColors = {
  hit: 'bg-green-100 text-green-700',
  noHit: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-700',
}

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl shadow-md p-4 flex flex-col items-center bg-white/90 ${color || ''}`}>
      <span className="text-xs text-gray-500 font-medium mb-1">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  )
}

function TagPill({ tag }) {
  return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mr-1 mb-1 inline-block">{tag}</span>
}

function App() {
  const [entry, setEntry] = useState(emptyEntry)
  const [entries, setEntries] = useState([])
  const [message, setMessage] = useState('')
  const [modal, setModal] = useState('')
  const [view, setView] = useState('calendar')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState({
    levelType: 'all',
    status: 'all',
    date: ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('toptick-entries') || '[]')
    setEntries(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('toptick-entries', JSON.stringify(entries))
    // Save to txt file
    const txtContent = entries.map(e => 
      `${e.date} | ${e.price} | ${e.levelType} | ${e.status} | ${e.tags} | ${e.notes}`
    ).join('\n')
    const blob = new Blob([txtContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'toptick_levels.txt'
    a.click()
    URL.revokeObjectURL(url)
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

  const stats = {
    totalLevels: entries.length,
    redLevels: entries.filter(e => e.levelType === 'red').length,
    orangeLevels: entries.filter(e => e.levelType === 'orange').length,
    hitLevels: entries.filter(e => e.status === 'hit').length,
    noHitLevels: entries.filter(e => e.status === 'noHit').length,
    hitRate: entries.length ? Math.round((entries.filter(e => e.status === 'hit').length / entries.length) * 100) : 0
  }

  const addEntry = () => {
    if (!entry.date || !entry.price || !entry.levelType) return
    const newEntry = { ...entry, id: Date.now() }
    setEntries([newEntry, ...entries])
    setEntry(emptyEntry)
    setMessage('Level saved!')
    setTimeout(() => setMessage(''), 1500)
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setDeleteConfirm(null)
  }

  const updateEntryStatus = (id, status) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
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

  const exportScreenshots = async () => {
    const zip = new JSZip()
    entries.forEach(entry => {
      entry.screenshots.forEach((screenshot, index) => {
        const base64Data = screenshot.split(',')[1]
        const filename = `${entry.date}_${entry.price}_${entry.levelType}_${index + 1}.png`
        zip.file(filename, base64Data, { base64: true })
      })
    })
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'toptick_screenshots.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setMessage('Copied!')
    setTimeout(() => setMessage(''), 1500)
  }

  const filteredEntries = entries.filter(e => {
    if (filter.levelType !== 'all' && e.levelType !== filter.levelType) return false
    if (filter.status !== 'all' && e.status !== filter.status) return false
    if (filter.date && e.date !== filter.date) return false
    return true
  })

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  })

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9f0fa] to-[#f7fafd] text-[#1a2340]">
      {/* HEADER */}
      <header className="w-full py-8 px-4 flex flex-col items-center bg-gradient-to-r from-[#e0e7ff] to-[#f0f4ff] shadow-sm mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1a2340] mb-2">TopTick NQ Levels</h1>
        <p className="text-base text-[#6b7a99] font-medium">Your professional Nasdaq (NQ) level tracker</p>
      </header>

      {/* DASHBOARD GRID */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* LEFT: Stats & Add Level */}
        <section className="col-span-1 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Levels" value={stats.totalLevels} />
            <StatCard label="Hit Rate" value={stats.hitRate + '%'} color="bg-green-50" />
            <StatCard label="Red Levels" value={stats.redLevels} color="bg-red-50" />
            <StatCard label="Orange Levels" value={stats.orangeLevels} color="bg-orange-50" />
          </div>

          {/* Add Level Card */}
          <div className="rounded-2xl shadow-lg bg-white/90 p-6">
            <h2 className="text-lg font-bold mb-4 text-[#1a2340]">Add New Level</h2>
            <div className="space-y-3">
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 text-[#1a2340]"
                value={entry.date}
                onChange={e => setEntry({ ...entry, date: e.target.value })}
              />
              <input
                type="number"
                placeholder="NQ Price Level"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 text-[#1a2340]"
                value={entry.price}
                onChange={e => setEntry({ ...entry, price: e.target.value })}
              />
              <select
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 text-[#1a2340]"
                value={entry.levelType}
                onChange={e => setEntry({ ...entry, levelType: e.target.value })}
              >
                <option value="red">🔴 Red Level</option>
                <option value="orange">🟠 Orange Level</option>
              </select>
              <input
                type="text"
                placeholder="Tags (comma separated)"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 text-[#1a2340]"
                value={entry.tags}
                onChange={e => setEntry({ ...entry, tags: e.target.value })}
              />
              <textarea
                placeholder="Notes"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:outline-none bg-gray-50 text-[#1a2340]"
                value={entry.notes}
                onChange={e => setEntry({ ...entry, notes: e.target.value })}
              ></textarea>
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-[#1a2340]"
                onChange={e => handleFiles(e.target.files)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold shadow hover:from-blue-600 hover:to-cyan-500 transition"
                  onClick={addEntry}
                >
                  Save Level
                </button>
                <button
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-gray-200 to-gray-100 text-blue-700 font-semibold shadow hover:from-gray-300 hover:to-gray-200 transition"
                  onClick={exportData}
                >
                  Export Data
                </button>
              </div>
              <button
                className="w-full mt-2 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold shadow hover:from-green-500 hover:to-blue-500 transition"
                onClick={exportScreenshots}
              >
                Export Screenshots
              </button>
            </div>
          </div>
        </section>

        {/* MIDDLE: Calendar */}
        <section className="col-span-1 md:col-span-2 flex flex-col gap-8">
          {/* Calendar Card */}
          <div className="rounded-2xl shadow-lg bg-white/90 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a2340]">Levels Calendar</h2>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                >
                  &lt;
                </button>
                <span className="font-semibold text-[#1a2340] text-base">{format(selectedDate, 'MMMM yyyy')}</span>
                <button
                  className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-blue-400 pb-2">{day}</div>
              ))}
              {calendarDays.map(day => {
                const dayEntries = entries.filter(e => e.date === format(day, 'yyyy-MM-dd'))
                const isCurrent = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                return (
                  <div
                    key={day.toString()}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer border transition-all duration-200
                      ${dayEntries.length ? 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-300 shadow-md' : 'bg-gray-50 border-gray-200'}
                      ${isCurrent ? 'ring-2 ring-blue-400' : ''}`}
                    onClick={() => setFilter({ ...filter, date: format(day, 'yyyy-MM-dd') })}
                  >
                    <span className="font-semibold text-base text-[#1a2340]">{format(day, 'd')}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayEntries.map(entry => (
                        <span
                          key={entry.id}
                          className={`w-3 h-3 rounded-full border-2 border-white shadow ${
                            entry.status === 'hit' ? 'bg-green-400' :
                            entry.status === 'noHit' ? 'bg-red-400' :
                            'bg-yellow-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Levels List Card */}
          <div className="rounded-2xl shadow-lg bg-white/90 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a2340]">Levels List</h2>
              <div className="flex gap-2">
                <select
                  className="px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-[#1a2340]"
                  value={filter.levelType}
                  onChange={e => setFilter({ ...filter, levelType: e.target.value })}
                >
                  <option value="all">All Types</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                </select>
                <select
                  className="px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-[#1a2340]"
                  value={filter.status}
                  onChange={e => setFilter({ ...filter, status: e.target.value })}
                >
                  <option value="all">All Status</option>
                  <option value="hit">Hit</option>
                  <option value="noHit">No Hit</option>
                  <option value="pending">Pending</option>
                </select>
                <input
                  type="date"
                  className="px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 text-[#1a2340]"
                  value={filter.date}
                  onChange={e => setFilter({ ...filter, date: e.target.value })}
                />
              </div>
            </div>
            <div ref={listRef} className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {filteredEntries.length === 0 && (
                <div className="text-center text-gray-400 py-8">No levels found for selected filters.</div>
              )}
              {filteredEntries.map((e) => (
                <div key={e.id} className="rounded-xl bg-gradient-to-br from-white to-blue-50 shadow flex flex-col md:flex-row md:items-center justify-between p-4 gap-4 animate-fade-in border border-blue-100">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg font-bold text-sm shadow ${levelTypeColors[e.levelType]}`}>{e.levelType === 'red' ? '🔴 Red' : '🟠 Orange'}</span>
                    <span className="ml-0 md:ml-4 text-lg font-bold text-blue-900 cursor-pointer hover:underline" onClick={() => copyToClipboard(e.price)}>${e.price}</span>
                    <span className={`ml-0 md:ml-4 px-2 py-1 rounded text-xs font-semibold ${statusColors[e.status]}`}>{e.status === 'hit' ? 'Hit' : e.status === 'noHit' ? 'No Hit' : 'Pending'}</span>
                    <span className="ml-0 md:ml-4 text-xs text-gray-400">{e.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2 md:mt-0">
                    {e.tags && e.tags.split(',').map((tag, i) => <TagPill key={i} tag={tag.trim()} />)}
                  </div>
                  <div className="flex gap-2 items-center mt-2 md:mt-0">
                    <select
                      className="px-2 py-1 rounded border border-gray-200 bg-gray-50 text-[#1a2340]"
                      value={e.status}
                      onChange={ev => updateEntryStatus(e.id, ev.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="hit">Hit</option>
                      <option value="noHit">No Hit</option>
                    </select>
                    <button
                      className="px-2 py-1 rounded-lg bg-red-100 text-red-700 font-bold hover:bg-red-200 transition"
                      onClick={() => setDeleteConfirm(e.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl border border-red-200">
            <h3 className="text-[#1a2340] text-xl font-bold mb-4">Delete Level?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this level? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                onClick={() => deleteEntry(deleteConfirm)}
              >
                Delete
              </button>
              <button
                className="flex-1 py-2 bg-gray-100 text-[#1a2340] rounded-lg hover:bg-gray-200 transition font-semibold"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setModal('')}>
          <img src={modal} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain border-4 border-white" />
          <button className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition" onClick={() => setModal('')}>&times;</button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in font-semibold z-50">
          {message}
        </div>
      )}
    </div>
  )
}

export default App
