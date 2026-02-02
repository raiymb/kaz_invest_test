require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const chatRoutes = require('./routes/chatRoutes')

const app = express()
const PORT = process.env.PORT || 8000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Structured logging utility
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
	warn: (message, meta = {}) => {
		console.warn(
			JSON.stringify({
				level: 'warn',
				timestamp: new Date().toISOString(),
				message,
				...meta,
			}),
		)
	},
}

// Security middleware
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
	}),
)

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(',')
	: ['http://localhost:5173', 'http://localhost:3000']

app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) return callback(null, true)

			if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
				callback(null, true)
			} else {
				logger.warn('CORS blocked origin', { origin })
				callback(new Error('Not allowed by CORS'))
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	}),
)

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Request logging middleware
app.use((req, res, next) => {
	const start = Date.now()

	res.on('finish', () => {
		const duration = Date.now() - start
		logger.info('Request processed', {
			method: req.method,
			path: req.path,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
			userAgent: req.get('user-agent'),
			ip: req.ip,
		})
	})

	next()
})

// Rate limiting - different limits for different routes
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: { error: 'Too many requests, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path })
		res
			.status(429)
			.json({ error: 'Too many requests, please try again later.' })
	},
})

const chatLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 20, // 20 requests per minute for chat
	message: {
		error:
			'Chat rate limit exceeded. Please wait before sending more messages.',
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		logger.warn('Chat rate limit exceeded', { ip: req.ip })
		res
			.status(429)
			.json({
				error:
					'Chat rate limit exceeded. Please wait before sending more messages.',
			})
	},
})

app.use(generalLimiter)

// API routes with specific rate limiting
app.use('/api', chatLimiter, chatRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: NODE_ENV,
	})
})

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Endpoint not found' })
})

// Global error handler
app.use((err, req, res, next) => {
	logger.error('Unhandled error', {
		error: err.message,
		stack: NODE_ENV === 'development' ? err.stack : undefined,
		path: req.path,
		method: req.method,
	})

	// Don't leak error details in production
	const errorResponse =
		NODE_ENV === 'development'
			? { error: err.message, stack: err.stack }
			: { error: 'An unexpected error occurred' }

	res.status(err.status || 500).json(errorResponse)
})

// Graceful shutdown handling
const server = app.listen(PORT, () => {
	logger.info('Server started', { port: PORT, environment: NODE_ENV })
})

const gracefulShutdown = signal => {
	logger.info(`${signal} received. Shutting down gracefully...`)
	server.close(() => {
		logger.info('Server closed')
		process.exit(0)
	})

	// Force shutdown after 10 seconds
	setTimeout(() => {
		logger.error('Forced shutdown after timeout')
		process.exit(1)
	}, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
