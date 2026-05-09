import { useMemo, useState } from 'react'
import './App.css'

const URL_REGEX = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i

function App() {
  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const isValidUrl = useMemo(() => URL_REGEX.test(longUrl.trim()), [longUrl])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsCopied(false)

    if (!isValidUrl) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl.trim() }),
      })

      if (!response.ok) {
        throw new Error('Something went wrong while shortening this URL.')
      }

      const data = await response.text()
      setShortUrl(data)
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to connect to the server.')
      setShortUrl('')
    } finally {
      setIsLoading(false)
    }
  }

  const copyShortUrl = async () => {
    if (!shortUrl) return

    try {
      await navigator.clipboard.writeText(shortUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    } catch {
      setError('Copy failed. Please copy the URL manually.')
    }
  }

  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">URL Shortner</p>
        <h1>Make long links short and shareable</h1>
        <p className="subtitle">
          Paste a long URL below and generate a compact link powered by your Spring Boot backend.
        </p>

        <form onSubmit={handleSubmit} className="shortener-form">
          <label htmlFor="urlInput" className="sr-only">
            Enter URL
          </label>
          <input
            id="urlInput"
            type="url"
            placeholder="https://example.com/very/long/link"
            value={longUrl}
            onChange={(event) => setLongUrl(event.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Shortening…' : 'Shorten URL'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {shortUrl && (
          <div className="result">
            <p>Your short URL is ready:</p>
            <a href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>
            <div className="actions">
              <button type="button" onClick={copyShortUrl}>
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <a href={shortUrl} target="_blank" rel="noreferrer" className="visit-link">
                Open
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
