import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Custom hook for Web Speech API voice recognition
 * @param {string} langCode - BCP 47 language code (e.g., 'en-US', 'ru-RU')
 * @returns {Object} Speech recognition state and controls
 */
const useSpeechRecognition = (langCode = 'en-US') => {
	const [text, setText] = useState('')
	const [isListening, setIsListening] = useState(false)
	const [isSupported] = useState(() => {
		return (
			typeof window !== 'undefined' &&
			(window.SpeechRecognition || window.webkitSpeechRecognition) !== undefined
		)
	})
	const [error, setError] = useState(null)

	const recognitionRef = useRef(null)

	// Initialize speech recognition
	useEffect(() => {
		if (!isSupported) return

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition

		const recognition = new SpeechRecognition()
		recognition.continuous = false
		recognition.interimResults = true // Get interim results for better UX
		recognition.maxAlternatives = 1
		recognition.lang = langCode

		recognition.onresult = event => {
			const lastResult = event.results[event.results.length - 1]
			const transcript = lastResult[0].transcript

			setText(transcript)

			// Only stop listening when we have a final result
			if (lastResult.isFinal) {
				setIsListening(false)
			}
		}

		recognition.onerror = event => {
			console.error('Speech recognition error:', event.error)

			let errorMessage = 'Speech recognition error'
			switch (event.error) {
				case 'no-speech':
					errorMessage = 'No speech detected. Please try again.'
					break
				case 'audio-capture':
					errorMessage = 'No microphone found.'
					break
				case 'not-allowed':
					errorMessage = 'Microphone access denied.'
					break
				case 'network':
					errorMessage = 'Network error during recognition.'
					break
				default:
					errorMessage = `Error: ${event.error}`
			}

			setError(errorMessage)
			setIsListening(false)
		}

		recognition.onend = () => {
			setIsListening(false)
		}

		recognitionRef.current = recognition

		// Cleanup
		return () => {
			if (recognitionRef.current) {
				try {
					recognitionRef.current.abort()
				} catch {
					// Ignore abort errors
				}
			}
		}
	}, [isSupported, langCode])

	// Update language when it changes
	useEffect(() => {
		if (recognitionRef.current && langCode) {
			recognitionRef.current.lang = langCode
		}
	}, [langCode])

	const startListening = useCallback(() => {
		if (!recognitionRef.current || isListening) return

		setError(null)
		setText('')

		try {
			recognitionRef.current.start()
			setIsListening(true)
		} catch (err) {
			console.error('Failed to start speech recognition:', err)
			setError('Failed to start voice recognition')
		}
	}, [isListening])

	const stopListening = useCallback(() => {
		if (!recognitionRef.current) return

		try {
			recognitionRef.current.stop()
		} catch {
			// Ignore stop errors
		}
		setIsListening(false)
	}, [])

	return {
		text,
		setText,
		isListening,
		startListening,
		stopListening,
		isSupported,
		error,
	}
}

export default useSpeechRecognition
