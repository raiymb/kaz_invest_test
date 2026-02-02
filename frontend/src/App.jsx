import { Menu, PlusCircle, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import './App.css'
import ChatInput from './components/ChatInput'
import HeroSection from './components/HeroSection'
import LanguageSwitcher from './components/LanguageSwitcher'
import MessageList from './components/MessageList'
import Sidebar from './components/Sidebar'
import useSpeechRecognition from './hooks/useSpeechRecognition'
import { sendMessageToAI } from './services/chatService'
import { languageOptions, translations } from './translations'

// Custom hook for managing chat sessions with localStorage persistence
const useChatSessions = () => {
	const [sessions, setSessions] = useState(() => {
		try {
			const saved = localStorage.getItem('chat_sessions')
			return saved ? JSON.parse(saved) : []
		} catch {
			return []
		}
	})

	const [currentSessionId, setCurrentSessionId] = useState(() => {
		return localStorage.getItem('current_session_id') || null
	})

	useEffect(() => {
		localStorage.setItem('chat_sessions', JSON.stringify(sessions))
	}, [sessions])

	useEffect(() => {
		if (currentSessionId) {
			localStorage.setItem('current_session_id', currentSessionId)
		} else {
			localStorage.removeItem('current_session_id')
		}
	}, [currentSessionId])

	const createSession = useCallback(() => {
		const newSession = {
			id: uuidv4(),
			title: 'New Chat',
			messages: [],
			createdAt: new Date().toISOString(),
		}
		setSessions(prev => [newSession, ...prev])
		setCurrentSessionId(newSession.id)
		return newSession.id
	}, [])

	const updateSessionMessages = useCallback((sessionId, newMessages) => {
		setSessions(prev =>
			prev.map(session => {
				if (session.id === sessionId) {
					let title = session.title
					if (session.title === 'New Chat' && newMessages.length > 0) {
						const firstUserMsg = newMessages.find(m => m.role === 'user')
						if (firstUserMsg) {
							title =
								firstUserMsg.content.slice(0, 35) +
								(firstUserMsg.content.length > 35 ? '...' : '')
						}
					}
					return { ...session, messages: newMessages, title }
				}
				return session
			}),
		)
	}, [])

	const deleteSession = useCallback(
		id => {
			setSessions(prev => {
				const newSessions = prev.filter(s => s.id !== id)
				if (currentSessionId === id) {
					setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null)
				}
				return newSessions
			})
		},
		[currentSessionId],
	)

	const getCurrentSession = useCallback(() => {
		return sessions.find(s => s.id === currentSessionId)
	}, [sessions, currentSessionId])

	return {
		sessions,
		currentSessionId,
		setCurrentSessionId,
		createSession,
		updateSessionMessages,
		deleteSession,
		getCurrentSession,
	}
}

// Custom hook for language management
const useLanguage = () => {
	const [lang, setLang] = useState(
		() => localStorage.getItem('app_lang') || 'en',
	)

	useEffect(() => {
		localStorage.setItem('app_lang', lang)
	}, [lang])

	const currentT = translations[lang]
	const currentVoice =
		languageOptions.find(opt => opt.code === lang)?.voice || 'en-US'

	return { lang, setLang, currentT, currentVoice }
}

function App() {
	const scrollContainerRef = useRef(null)

	const {
		sessions,
		currentSessionId,
		setCurrentSessionId,
		createSession,
		updateSessionMessages,
		deleteSession,
		getCurrentSession,
	} = useChatSessions()

	const { lang, setLang, currentT, currentVoice } = useLanguage()

	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	const {
		text: speechText,
		startListening,
		stopListening,
		isListening,
		isSupported,
		setText: setSpeechText,
	} = useSpeechRecognition(currentVoice)

	// Sync messages with current session
	useEffect(() => {
		const session = getCurrentSession()
		setMessages(session?.messages || [])
	}, [currentSessionId, getCurrentSession])

	// Sync speech text with input
	useEffect(() => {
		if (speechText) setInput(speechText)
	}, [speechText])

	const handleSend = useCallback(async () => {
		const trimmedInput = input.trim()
		if (!trimmedInput || loading) return

		let activeId = currentSessionId
		if (!activeId) {
			activeId = createSession()
		}

		const userMessage = {
			role: 'user',
			content: trimmedInput,
			timestamp: new Date().toISOString(),
		}
		const updatedMessages = [...messages, userMessage]

		setMessages(updatedMessages)
		updateSessionMessages(activeId, updatedMessages)
		setInput('')
		setSpeechText('')
		setLoading(true)
		setError(null)

		try {
			const reply = await sendMessageToAI(trimmedInput)
			const botMessage = {
				role: 'assistant',
				content: reply,
				timestamp: new Date().toISOString(),
			}
			const finalMessages = [...updatedMessages, botMessage]

			setMessages(finalMessages)
			updateSessionMessages(activeId, finalMessages)
		} catch (err) {
			console.error('Chat error:', err)
			setError(currentT.error)
			const errorMessage = {
				role: 'assistant',
				content: currentT.error,
				isError: true,
				timestamp: new Date().toISOString(),
			}
			const failedMessages = [...updatedMessages, errorMessage]
			setMessages(failedMessages)
			updateSessionMessages(activeId, failedMessages)
		} finally {
			setLoading(false)
		}
	}, [
		input,
		loading,
		currentSessionId,
		messages,
		createSession,
		updateSessionMessages,
		setSpeechText,
		currentT,
	])

	const handleNewChat = useCallback(() => {
		createSession()
		setInput('')
		setSpeechText('')
		setLoading(false)
		setError(null)
		if (window.innerWidth < 768) setSidebarOpen(false)
	}, [createSession, setSpeechText])

	const handleQuickAction = useCallback(prompt => {
		setInput(prompt)
	}, [])

	const closeSidebar = useCallback(() => setSidebarOpen(false), [])
	const openSidebar = useCallback(() => setSidebarOpen(true), [])

	const hasMessages = messages.length > 0

	return (
		<div className='app-container bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#0f172a] text-white font-sans'>
			{/* Animated Background Orbs */}
			<div className='bg-orb bg-orb-1' aria-hidden='true' />
			<div className='bg-orb bg-orb-2' aria-hidden='true' />

			{/* Sidebar */}
			<Sidebar
				sessions={sessions}
				currentSessionId={currentSessionId}
				onSelectSession={setCurrentSessionId}
				onNewChat={handleNewChat}
				onDeleteSession={deleteSession}
				isOpen={sidebarOpen}
				onClose={closeSidebar}
				t={currentT}
			/>

			{/* Main Content Area */}
			<div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
				{/* Header */}
				<header className='flex-shrink-0 flex justify-between items-center px-4 md:px-6 py-3 glass-strong border-b border-white/5 z-10'>
					<div className='flex items-center gap-3'>
						<button
							onClick={openSidebar}
							className='md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all'
							aria-label='Open menu'
						>
							<Menu size={22} />
						</button>

						<div className='flex items-center gap-2.5'>
							<div className='relative'>
								<div className='absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-50' />
								<div className='relative bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg'>
									<Sparkles size={22} className='text-white' />
								</div>
							</div>
							<span className='font-bold text-xl tracking-tight hidden sm:block'>
								AI Assistant
							</span>
						</div>
					</div>

					<div className='flex items-center gap-2 md:gap-3'>
						<button
							onClick={handleNewChat}
							className='md:hidden flex items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10'
							aria-label='New chat'
						>
							<PlusCircle size={20} />
						</button>

						<LanguageSwitcher currentLang={lang} setLang={setLang} />
					</div>
				</header>

				{/* Chat Messages Area */}
				<div className='flex-1 min-h-0 overflow-hidden'>
					<div
						ref={scrollContainerRef}
						className='h-full overflow-y-auto overflow-x-hidden'
					>
						{!hasMessages ? (
							<HeroSection t={currentT} onQuickAction={handleQuickAction} />
						) : (
							<MessageList
								messages={messages}
								loading={loading}
								scrollContainerRef={scrollContainerRef}
							/>
						)}
					</div>
				</div>

				{/* Input Area - Fixed at bottom */}
				<div className='flex-shrink-0 w-full px-4 pb-3 pt-2 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/95 to-transparent border-t border-white/5 z-10'>
					<div className='max-w-3xl mx-auto w-full'>
						<ChatInput
							input={input}
							setInput={setInput}
							onSend={handleSend}
							isListening={isListening}
							startListening={startListening}
							stopListening={stopListening}
							isSpeechSupported={isSupported}
							isLoading={loading}
							t={currentT}
						/>
						{error && (
							<p
								className='text-red-400 text-sm text-center mt-2 animate-fade-in'
								role='alert'
							>
								{error}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
