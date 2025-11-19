import { useState } from 'react'
import '../styles/WordForm.css'

interface WordFormProps {
  onSubmit: (word: string) => void
}

export default function WordForm({ onSubmit }: WordFormProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    await onSubmit(input)
    setInput('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="word-form">
      <div className="word-form-group">
        <label htmlFor="word-input" className="word-form-label">
          Kata Anda
        </label>
        <input
          id="word-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik kata yang bermakna..."
          disabled={loading}
          maxLength={50}
          className="word-input"
          autoFocus
        />
        <div className="word-form-hint">
          {input.length}/50 karakter
        </div>
      </div>
      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? '⏳ Mengirim...' : '✓ Bagikan Kata'}
      </button>
    </form>
  )
}
