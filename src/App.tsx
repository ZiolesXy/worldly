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
        <h1>Wordly Cloud</h1>
        <p>Bagikan satu kata Anda hari ini</p>
      </header>

      <main className="app-main">
        <div className="form-section">
          <WordForm onSubmit={handleSubmit} />
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>

        <div className="cloud-section">
          <h2>Kata-kata Hari Ini</h2>
          {words.length > 0 ? (
            <WordCloud data={words} />
          ) : (
            <p className="no-words">Belum ada kata hari ini</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
