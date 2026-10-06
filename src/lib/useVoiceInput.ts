import { useCallback, useEffect, useRef, useState } from 'react'

// Web Speech API belum punya tipe resmi di lib.dom TypeScript — deklarasi minimal di sini.
interface SpeechRecognitionResultLike {
  transcript: string
}
interface SpeechRecognitionEventLike extends Event {
  results: { 0: { 0: SpeechRecognitionResultLike }; length: number }
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: Event) => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionLike) | null
}

export function useVoiceInput(lang = 'id-ID') {
  const [supported] = useState(() => getSpeechRecognition() !== null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const start = useCallback(
    (onResult: (text: string) => void) => {
      const SpeechRecognition = getSpeechRecognition()
      if (!SpeechRecognition) {
        setError('Browser ini tidak mendukung input suara.')
        return
      }
      setError(null)
      const recognition = new SpeechRecognition()
      recognition.lang = lang
      recognition.interimResults = false
      recognition.continuous = false
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript
        onResult(text)
      }
      recognition.onerror = () => {
        setError('Gagal menangkap suara. Coba lagi.')
        setListening(false)
      }
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
      try {
        recognition.start()
        setListening(true)
      } catch (err) {
        console.error(err)
        setError('Tidak bisa mengakses mikrofon. Pastikan izin mic diaktifkan.')
        setListening(false)
      }
    },
    [lang]
  )

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { supported, listening, error, start, stop }
}
