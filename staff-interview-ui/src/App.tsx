import { useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:4000'

const difficulties = [
  { value: '', label: 'Select difficulty' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

type Challenge = {
  id: string
  title: string
  description: string
  difficulty: string
}

type Submission = {
  id: string | number
  name: string
  code: string
  challengeId: string
  submittedAt?: string
}

function App() {
  const [difficulty, setDifficulty] = useState('')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loadingChallenge, setLoadingChallenge] = useState(false)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loadingSubmission, setLoadingSubmission] = useState(false)

  const getRandomChallenge = async () => {
    if (!difficulty) return
    setLoadingChallenge(true)
    setChallenge(null)
    setError('')
    setSubmitted(false)
    setSubmission(null)
    try {
      const res = await fetch(`${API_URL}/challenge/random?difficulty=${difficulty}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Could not fetch challenge')
      }
      const data = await res.json()
      setChallenge(data)
      if (name) {
        fetchSubmission(name, data.id)
      } else {
        setSubmission(null)
        setCode('')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingChallenge(false)
    }
  }

  const fetchSubmission = async (userName: string, challengeId: string) => {
    setLoadingSubmission(true)
    setSubmission(null)
    setCode('')
    try {
      const res = await fetch(`${API_URL}/submission?name=${encodeURIComponent(userName)}&challengeId=${encodeURIComponent(challengeId)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.submissions && data.submissions.length > 0) {
          setSubmission(data.submissions[0])
          setCode(data.submissions[0].code)
          setName(data.submissions[0].name)
        }
      }
    } catch {}
    setLoadingSubmission(false)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (challenge && e.target.value) {
      fetchSubmission(e.target.value, challenge.id)
    } else {
      setSubmission(null)
      setCode('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!challenge) return
    setSubmitting(true)
    setError('')
    setSubmitted(false)
    try {
      let res
      if (submission) {
        res = await fetch(`${API_URL}/submission`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: submission.id, code, name, challengeId: challenge.id })
        })
      } else {
        res = await fetch(`${API_URL}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, name, challengeId: challenge.id })
        })
      }
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }
      setSubmitted(true)
      fetchSubmission(name, challenge.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Engineer Coding Exercise</h1>
      </header>
      <main>
        <section className="challenge-section">
          <label htmlFor="difficulty-select" style={{ color: 'var(--text-secondary)' }}>
            Select difficulty:
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              disabled={submitting || loadingChallenge}
              style={{ marginLeft: 8 }}
            >
              {difficulties.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={getRandomChallenge}
            disabled={!difficulty || loadingChallenge}
            style={{ marginLeft: 16 }}
          >
            {loadingChallenge ? 'Loading...' : 'Get Random Challenge'}
          </button>
        </section>
        {challenge && (
          <section className="challenge-section">
            <h2>{challenge.title}</h2>
            <p>{challenge.description}</p>
            <span className="difficulty-tag">{challenge.difficulty.toUpperCase()}</span>
          </section>
        )}
        {challenge && (
          <form className="editor-form" onSubmit={handleSubmit}>
            <label>
              Your Name:
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                required
                disabled={submitting}
              />
            </label>
            <label>
              Your Solution:
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={10}
                placeholder={`function ... {\n  // your code\n}`}
                required
                disabled={submitting}
              />
            </label>
            <button type="submit" disabled={submitting || !name || !code}>
              {submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Solution'}
            </button>
            {submitted && <div className="success">Submission received!</div>}
            {error && <div className="error">{error}</div>}
          </form>
        )}
        {submission && (
          <section className="challenge-section" style={{ marginTop: 24 }}>
            <h3>Your Previous Submission</h3>
            <div>
              <strong>Name:</strong> {submission.name}
            </div>
            <div>
              <strong>Submitted At:</strong> {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
            </div>
            <div>
              <strong>Code:</strong>
              <pre style={{
                background: 'var(--input-bg)',
                color: 'var(--text)',
                padding: '1em',
                borderRadius: 4,
                marginTop: 8,
                overflowX: 'auto'
              }}>{submission.code}</pre>
            </div>
          </section>
        )}
        {!challenge && error && <div className="error">{error}</div>}
      </main>
    </div>
  )
}

export default App
