import { useState, useEffect } from 'react'
import './App.css'
import WordForm from './components/WordForm'
import WordCloud from './components/WordCloud'

interface WordData {
  text: string
  value: number
}

function App() {
  const [words, setWords] = useState<WordData[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const fetchWords = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/words')
      const data = await response.json()
      setWords(data.words || [])
    } catch (err) {
      console.error('Error fetching words:', err)
    }
  }

  useEffect(() => {
    fetchWords()
    const interval = setInterval(fetchWords, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (word: string) => {
    setError('')
    setSuccess('')
    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Gagal mengirim kata')
        return
      }

      setSuccess(data.message)
      fetchWords()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Terjadi kesalahan koneksi')
      console.error('Error:', err)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <h1>✨ Wordly</h1>
            <p>Bagikan kata Anda, lihat dunia berbicara</p>
          </div>
          <nav className="header-nav">
            <a href="#" className="nav-link">Dashboard</a>
            <a href="#" className="nav-link">Tentang</a>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <div className="form-section">
          <div className="card">
            <div className="card-header">
              <h2>Bagikan Kata Anda</h2>
              <p>Tambahkan kata yang bermakna untuk Anda hari ini</p>
            </div>
            <div className="card-body">
              <WordForm onSubmit={handleSubmit} />
              {error && <div className="message message-error">{error}</div>}
              {success && <div className="message message-success">{success}</div>}
            </div>
          </div>
        </div>

        <div className="cloud-section">
          <div className="card">
            <div className="card-header">
              <h2>Kata-kata Hari Ini</h2>
              <p>Lihat apa yang dibagikan komunitas</p>
            </div>
            <div className="card-body">
              {words.length > 0 ? (
                <WordCloud data={words} />
              ) : (
                <div className="no-data">
                  <div className="no-data-icon">📝</div>
                  <div className="no-data-text">Belum ada kata hari ini</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
