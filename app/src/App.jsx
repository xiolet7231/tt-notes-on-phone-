import { useState, useEffect, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import JSZip from 'jszip'

const emptyEntry = {
  date: '',
  price: '',
  levelType: 'red', // 'red' or 'orange'
  status: 'pending', // 'hit', 'noHit', 'pending'
  notes: '',
  tags: '',
  screenshots: []
}

function App() {
  const [entry, setEntry] = useState(emptyEntry)
  const [entries, setEntries] = useState([])
  const [message, setMessage] = useState('')
  const [modal, setModal] = useState('')
  const [view, setView] = useState('list')
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
    setMessage('Zapisano!')
    setTimeout(() => setMessage(''), 1500)
    // Scroll to top with animation
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1f2b] p-4 font-[Inter]">
      <h1 className="text-center text-2xl font-semibold text-white mb-1">
        TopTick NQ Levels
      </h1>

      {/* Stats Dashboard */}
      <div className="max-w-md mx-auto mb-6 p-4 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
        <div className="grid grid-cols-2 gap-4 text-white">
          <div>
            <p className="text-sm text-gray-400">Total Levels</p>
            <p className="text-xl font-semibold">{stats.totalLevels}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Hit Rate</p>
            <p className="text-xl font-semibold">{stats.hitRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Red Levels</p>
            <p className="text-xl font-semibold text-red-400">{stats.redLevels}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Orange Levels</p>
            <p className="text-xl font-semibold text-orange-400">{stats.orangeLevels}</p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="max-w-md mx-auto mb-4">
        <div className="flex space-x-2">
          <button
            className={`flex-1 py-2 rounded-lg ${view === 'list' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'}`}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            className={`flex-1 py-2 rounded-lg ${view === 'calendar' ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'}`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-md mx-auto mb-4 p-4 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
        <div className="grid grid-cols-3 gap-4">
          <select
            className="w-full py-2 px-3 bg-white/20 text-white rounded-lg focus:outline-none"
            value={filter.levelType}
            onChange={(e) => setFilter({ ...filter, levelType: e.target.value })}
          >
            <option value="all">All Types</option>
            <option value="red">Red</option>
            <option value="orange">Orange</option>
          </select>
          <select
            className="w-full py-2 px-3 bg-white/20 text-white rounded-lg focus:outline-none"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="hit">Hit</option>
            <option value="noHit">No Hit</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="date"
            className="w-full py-2 px-3 bg-white/20 text-white rounded-lg focus:outline-none"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
        </div>
      </div>

      {/* Entry Form */}
      <div className="max-w-md mx-auto p-6 space-y-4 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
        <input
          type="date"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.date}
          onChange={(e) => setEntry({ ...entry, date: e.target.value })}
        />
        <input
          type="number"
          placeholder="NQ Price Level"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.price}
          onChange={(e) => setEntry({ ...entry, price: e.target.value })}
        />
        <select
          className="w-full py-3 px-4 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.levelType}
          onChange={(e) => setEntry({ ...entry, levelType: e.target.value })}
        >
          <option value="red">🔴 Red Level</option>
          <option value="orange">🟠 Orange Level</option>
        </select>
        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full py-3 px-4 bg-white/20 text-white placeholder:text-gray-300 rounded-lg focus:outline-none focus:bg-white/30 transition"
          value={entry.tags}
          onChange={(e) => setEntry({ ...entry, tags: e.target.value })}
        />
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
          Save Level
        </button>
        <div className="flex space-x-2">
          <button
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-medium rounded-lg shadow-md hover:from-emerald-600 hover:to-cyan-500 transition"
            onClick={exportData}
          >
            Export Data
          </button>
          <button
            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-medium rounded-lg shadow-md hover:from-emerald-600 hover:to-cyan-500 transition"
            onClick={exportScreenshots}
          >
            Export Screenshots
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="max-w-md mx-auto mt-8 p-4 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-gray-400 text-sm py-2">
                {day}
              </div>
            ))}
            {calendarDays.map(day => {
              const dayEntries = entries.filter(e => e.date === format(day, 'yyyy-MM-dd'))
              return (
                <div
                  key={day.toString()}
                  className={`aspect-square p-1 rounded-lg cursor-pointer hover:bg-white/10 transition ${
                    dayEntries.length ? 'bg-white/20' : ''
                  }`}
                  onClick={() => setFilter({ ...filter, date: format(day, 'yyyy-MM-dd') })}
                >
                  <div className="text-white text-sm">{format(day, 'd')}</div>
                  {dayEntries.map(entry => (
                    <div
                      key={entry.id}
                      className={`w-2 h-2 rounded-full mt-1 ${
                        entry.status === 'hit' ? 'bg-green-400' :
                        entry.status === 'noHit' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div ref={listRef} className="mt-8 space-y-6 max-w-md mx-auto">
          {filteredEntries.map((e) => (
            <div key={e.id} className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
                <div className="flex items-center">
                  <div className={`w-1 h-8 rounded-full ${
                    e.levelType === 'red' ? 'bg-red-400' : 'bg-orange-400'
                  }`}></div>
                  <div className="ml-3">
                    <span className="text-white font-medium">{e.date}</span>
                    <span 
                      className="text-gray-400 ml-2 cursor-pointer hover:text-white transition"
                      onClick={() => copyToClipboard(e.price)}
                    >
                      ${e.price}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-4 items-center">
                  <select
                    className="bg-white/20 text-white rounded px-2 py-1"
                    value={e.status}
                    onChange={(ev) => updateEntryStatus(e.id, ev.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="hit">Hit</option>
                    <option value="noHit">No Hit</option>
                  </select>
                  <button 
                    className="text-red-400 hover:text-red-300" 
                    onClick={() => setDeleteConfirm(e.id)}
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                {e.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {e.tags.split(',').map((tag, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-1 bg-white/10 text-white text-sm rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {e.notes && (
                  <p 
                    className="text-gray-200 mb-4 cursor-pointer hover:text-white transition"
                    onClick={() => copyToClipboard(e.notes)}
                  >
                    {e.notes}
                  </p>
                )}
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
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-sm mx-4">
            <h3 className="text-white text-xl font-semibold mb-4">Delete Level?</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this level? This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={() => deleteEntry(deleteConfirm)}
              >
                Delete
              </button>
              <button
                className="flex-1 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
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
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setModal('')}
        >
          <img 
            src={modal} 
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" 
          />
          <button 
            className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition"
            onClick={() => setModal('')}
          >
            &times;
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="fixed top-4 right-4 bg-white/20 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {message}
        </div>
      )}
    </div>
  )
}

export default App
