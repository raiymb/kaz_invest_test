const { GoogleGenerativeAI } = require('@google/generative-ai')

// Constants
const MAX_MESSAGE_LENGTH = 100000
const AI_TIMEOUT_MS = 30000
const DEFAULT_MODEL = 'gemini-2.5-flash'

// Structured logging
const logger = {
	info: (message, meta = {}) => {
		console.log(
			JSON.stringify({
				level: 'info',
				timestamp: new Date().toISOString(),
				message,
				...meta,
			}),
		)
	},
	error: (message, meta = {}) => {
		console.error(
			JSON.stringify({
				level: 'error',
				timestamp: new Date().toISOString(),
				message,
				...meta,
			}),
		)
	},
}

// Input validation
const validateMessage = message => {
	if (!message) {
		return { valid: false, error: 'Message is required' }
	}

	if (typeof message !== 'string') {
		return { valid: false, error: 'Message must be a string' }
	}

	const trimmedMessage = message.trim()

	if (trimmedMessage.length === 0) {
		return { valid: false, error: 'Message cannot be empty' }
	}

	if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
		return {
			valid: false,
			error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
		}
	}

	return { valid: true, message: trimmedMessage }
}

// Timeout wrapper for async operations
const withTimeout = (promise, timeoutMs, errorMessage) => {
	return Promise.race([
		promise,
		new Promise((_, reject) =>
			setTimeout(() => reject(new Error(errorMessage)), timeoutMs),
		),
	])
}

// Mock response for development/testing
const getMockResponse = message => {
	const responses = [
		`I understand you're asking about: "${message.slice(0, 50)}...". This is a mock response for testing.`,
		`Thanks for your message! In production, this would connect to Gemini AI. You said: "${message.slice(0, 50)}..."`,
		`Mock response: Your question about "${message.slice(0, 30)}..." is interesting! Set GEMINI_API_KEY for real responses.`,
	]
	return responses[Math.floor(Math.random() * responses.length)]
}

const chatController = async (req, res) => {
	const startTime = Date.now()
	const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

	try {
		const { message } = req.body

		// Validate input
		const validation = validateMessage(message)
		if (!validation.valid) {
			logger.info('Invalid request', { requestId, error: validation.error })
			return res.status(400).json({ error: validation.error })
		}

		const validatedMessage = validation.message
		const apiKey = process.env.GEMINI_API_KEY

		// Mock mode for development
		if (!apiKey || apiKey === 'mock-key' || apiKey === 'your-api-key-here') {
			logger.info('Using mock response', {
				requestId,
				reason: 'No valid API key',
			})

			// Simulate network delay
			await new Promise(resolve =>
				setTimeout(resolve, 500 + Math.random() * 500),
			)

			const mockReply = getMockResponse(validatedMessage)

			logger.info('Request completed', {
				requestId,
				duration: `${Date.now() - startTime}ms`,
				mode: 'mock',
			})

			return res.json({ reply: mockReply })
		}

		// Production mode with Gemini AI
		logger.info('Processing AI request', {
			requestId,
			messageLength: validatedMessage.length,
		})

		const genAI = new GoogleGenerativeAI(apiKey)
		const model = genAI.getGenerativeModel({
			model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
			generationConfig: {
				maxOutputTokens: 12000,
				temperature: 0.7,
			},
		})

		// Generate content with timeout
		const result = await withTimeout(
			model.generateContent(validatedMessage),
			AI_TIMEOUT_MS,
			'AI response timed out. Please try again.',
		)

		const response = await result.response
		const reply = response.text()

		if (!reply || reply.trim().length === 0) {
			throw new Error('Received empty response from AI')
		}

		logger.info('Request completed successfully', {
			requestId,
			duration: `${Date.now() - startTime}ms`,
			replyLength: reply.length,
		})

		res.json({ reply })
	} catch (error) {
		const duration = Date.now() - startTime

		// Categorize errors for appropriate responses
		let statusCode = 500
		let userMessage = 'Failed to process your request. Please try again.'

		if (error.message.includes('timed out')) {
			statusCode = 504
			userMessage = 'The AI is taking too long to respond. Please try again.'
		} else if (
			error.message.includes('quota') ||
			error.message.includes('rate limit')
		) {
			statusCode = 429
			userMessage = 'Service is temporarily busy. Please try again in a moment.'
		} else if (
			error.message.includes('API key') ||
			error.message.includes('authentication')
		) {
			statusCode = 503
			userMessage = 'AI service is temporarily unavailable.'
		} else if (error.message.includes('empty response')) {
			statusCode = 502
			userMessage = 'Received an invalid response. Please try again.'
		}

		logger.error('Request failed', {
			requestId,
			error: error.message,
			statusCode,
			duration: `${duration}ms`,
		})

		res.status(statusCode).json({ error: userMessage })
	}
}

module.exports = { chatController }
