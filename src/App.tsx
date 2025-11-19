import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactWordcloud from 'react-wordcloud';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

interface WordData {
  word: string;
  frequency: number;
}

function App() {
  const [word, setWord] = useState('');
  const [words, setWords] = useState<WordData[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userIp, setUserIp] = useState('');

  // Fetch user IP dan words saat komponen mount
  useEffect(() => {
    fetchUserIp();
    fetchWords();
    
    // Refresh words setiap 5 detik
    const interval = setInterval(fetchWords, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserIp = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user-ip`);
      setUserIp(response.data.ip);
    } catch (err) {
      console.error('Error fetching user IP:', err);
    }
  };

  const fetchWords = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/words`);
      if (response.data.success) {
        setWords(response.data.words);
      }
    } catch (err) {
      console.error('Error fetching words:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/submit`, {
        word: word.trim()
      });

      if (response.status === 201) {
        setSuccess(`Kata "${response.data.word}" berhasil disimpan!`);
        setWord('');
        // Refresh words setelah submit
        await fetchWords();
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data.error);
      } else if (err.response?.status === 400) {
        setError(err.response.data.error);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform words untuk react-wordcloud
  const wordcloudData = words.map(item => ({
    text: item.word,
    value: item.frequency * 10 // Scale untuk visibility
  }));

  const options = {
    rotations: 2,
    rotationAngles: [0, 90],
    fontSizes: [20, 60],
    width: 600,
    height: 400,
    deterministic: false
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🌍 Wordly</h1>
        <p className="subtitle">Bagikan satu kata Anda hari ini</p>
        {userIp && <p className="user-ip">IP Anda: {userIp}</p>}
      </div>

      <div className="app-content">
        <div className="form-section">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Masukkan satu kata..."
                maxLength={100}
                disabled={loading}
                className="word-input"
              />
              <button
                type="submit"
                disabled={loading || word.trim().length === 0}
                className="submit-btn"
              >
                {loading ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>

        <div className="wordcloud-section">
          <h2>Kata-kata Hari Ini</h2>
          {wordcloudData.length > 0 ? (
            <div className="wordcloud-container">
              <ReactWordcloud
                words={wordcloudData}
                width={600}
                height={400}
                options={options}
              />
            </div>
          ) : (
            <div className="no-words">
              <p>Belum ada kata hari ini. Jadilah yang pertama!</p>
            </div>
          )}
        </div>
      </div>

      <div className="app-footer">
        <p>Setiap IP hanya bisa menginput 1 kata per hari</p>
      </div>
    </div>
  );
}

export default App;
