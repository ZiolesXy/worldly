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
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Masukkan satu kata..."
        disabled={loading}
        maxLength={50}
        className="word-input"
      />
      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Mengirim...' : 'Kirim'}
      </button>
    </form>
  )
}
