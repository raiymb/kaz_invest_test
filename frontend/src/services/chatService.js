import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const REQUEST_TIMEOUT = 35000 // 35 seconds (slightly more than backend timeout)
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

// Create axios instance with default config
const apiClient = axios.create({
	baseURL: API_URL,
	timeout: REQUEST_TIMEOUT,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Error types for better handling
const ErrorTypes = {
	NETWORK: 'NETWORK_ERROR',
	TIMEOUT: 'TIMEOUT_ERROR',
	RATE_LIMIT: 'RATE_LIMIT_ERROR',
	SERVER: 'SERVER_ERROR',
	VALIDATION: 'VALIDATION_ERROR',
	UNKNOWN: 'UNKNOWN_ERROR',
}

// Categorize errors
const categorizeError = error => {
	if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
		return {
			type: ErrorTypes.TIMEOUT,
			message: 'Request timed out. Please try again.',
		}
	}

	if (!error.response) {
		return {
			type: ErrorTypes.NETWORK,
			message: 'Unable to connect to the server. Please check your connection.',
		}
	}

	const status = error.response.status
	const serverMessage = error.response.data?.error

	if (status === 429) {
		return {
			type: ErrorTypes.RATE_LIMIT,
			message:
				serverMessage || 'Too many requests. Please wait before trying again.',
		}
	}

	if (status === 400) {
		return {
			type: ErrorTypes.VALIDATION,
			message: serverMessage || 'Invalid request. Please check your message.',
		}
	}

	if (status >= 500) {
		return {
			type: ErrorTypes.SERVER,
			message: serverMessage || 'Server error. Please try again later.',
		}
	}

	return {
		type: ErrorTypes.UNKNOWN,
		message: serverMessage || 'An unexpected error occurred.',
	}
}

// Delay utility
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// Retry logic for transient errors
const shouldRetry = (error, attempt) => {
	if (attempt >= MAX_RETRIES) return false

	const errorType = categorizeError(error).type

	// Only retry for network and timeout errors
	return errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.TIMEOUT
}

/**
 * Send a message to the AI backend
 * @param {string} message - The user's message
 * @returns {Promise<string>} - The AI's response
 * @throws {Error} - With categorized error message
 */
export const sendMessageToAI = async message => {
	if (!message || typeof message !== 'string' || message.trim().length === 0) {
		throw new Error('Message cannot be empty')
	}

	const trimmedMessage = message.trim()
	let lastError = null

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			if (attempt > 0) {
				console.log(`Retry attempt ${attempt} of ${MAX_RETRIES}`)
				await delay(RETRY_DELAY * attempt) // Exponential backoff
			}

			const response = await apiClient.post('/chat', {
				message: trimmedMessage,
			})

			if (!response.data?.reply) {
				throw new Error('Invalid response format from server')
			}

			return response.data.reply
		} catch (error) {
			lastError = error

			if (!shouldRetry(error, attempt)) {
				break
			}
		}
	}

	// All retries exhausted or non-retryable error
	const { message: errorMessage } = categorizeError(lastError)
	console.error('API Error:', lastError)
	throw new Error(errorMessage)
}

/**
 * Check if the API is available
 * @returns {Promise<boolean>}
 */
export const checkApiHealth = async () => {
	try {
		const response = await axios.get(`${API_URL.replace('/api', '')}/health`, {
			timeout: 5000,
		})
		return response.data?.status === 'healthy'
	} catch {
		return false
	}
}

export default { sendMessageToAI, checkApiHealth }
