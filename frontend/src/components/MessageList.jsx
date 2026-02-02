import { Bot, Check, Copy, User } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Code block with copy functionality
const CodeBlock = memo(({ children, className }) => {
	const [copied, setCopied] = useState(false)
	const codeString = String(children).replace(/\n$/, '')

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(codeString)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}, [codeString])

	return (
		<div className='relative group my-3'>
			<div className='absolute right-2 top-2 z-10'>
				<button
					onClick={handleCopy}
					className='p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100'
					aria-label={copied ? 'Copied' : 'Copy code'}
				>
					{copied ? (
						<Check size={14} className='text-green-400' />
					) : (
						<Copy size={14} className='text-gray-400' />
					)}
				</button>
			</div>
			<div className='bg-[#0d1117] rounded-xl border border-white/10 overflow-hidden'>
				<div className='flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10'>
					<div className='flex gap-1.5'>
						<div className='w-3 h-3 rounded-full bg-red-500/60' />
						<div className='w-3 h-3 rounded-full bg-yellow-500/60' />
						<div className='w-3 h-3 rounded-full bg-green-500/60' />
					</div>
					<span className='text-xs text-gray-500 ml-2'>
						{className?.replace('language-', '') || 'code'}
					</span>
				</div>
				<pre className='p-4 overflow-x-auto custom-scrollbar'>
					<code className='text-sm font-mono text-gray-200'>{codeString}</code>
				</pre>
			</div>
		</div>
	)
})

CodeBlock.displayName = 'CodeBlock'

// Inline code component
const InlineCode = memo(({ children }) => (
	<code className='bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded text-sm font-mono'>
		{children}
	</code>
))

InlineCode.displayName = 'InlineCode'

// Markdown components configuration
const markdownComponents = {
	p: ({ children }) => (
		<p className='mb-3 last:mb-0 leading-relaxed'>{children}</p>
	),
	ul: ({ children }) => (
		<ul className='list-disc pl-5 mb-3 space-y-1.5'>{children}</ul>
	),
	ol: ({ children }) => (
		<ol className='list-decimal pl-5 mb-3 space-y-1.5'>{children}</ol>
	),
	li: ({ children }) => <li className='pl-1'>{children}</li>,
	a: ({ href, children }) => (
		<a
			href={href}
			className='text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors'
			target='_blank'
			rel='noopener noreferrer'
		>
			{children}
		</a>
	),
	h1: ({ children }) => (
		<h1 className='text-2xl font-bold mb-3 mt-4 first:mt-0'>{children}</h1>
	),
	h2: ({ children }) => (
		<h2 className='text-xl font-bold mb-2 mt-3 first:mt-0'>{children}</h2>
	),
	h3: ({ children }) => (
		<h3 className='text-lg font-semibold mb-2 mt-3 first:mt-0'>{children}</h3>
	),
	blockquote: ({ children }) => (
		<blockquote className='border-l-4 border-blue-500/50 pl-4 my-3 italic text-gray-300'>
			{children}
		</blockquote>
	),
	code: ({ inline, className, children }) => {
		if (inline) {
			return <InlineCode>{children}</InlineCode>
		}
		return <CodeBlock className={className}>{children}</CodeBlock>
	},
	pre: ({ children }) => <>{children}</>,
}

// Single message component
const Message = memo(({ message, index }) => {
	const isUser = message.role === 'user'
	const isError = message.isError

	return (
		<div
			className={`flex gap-3 md:gap-4 w-full animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
			style={{ animationDelay: `${index * 50}ms` }}
		>
			{/* Assistant Avatar */}
			{!isUser && (
				<div className='flex-shrink-0'>
					<div className='w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg'>
						<Bot size={18} className='text-white' />
					</div>
				</div>
			)}

			{/* Message Bubble */}
			<div
				className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-lg transition-all ${
					isUser
						? 'message-user text-white rounded-tr-md'
						: isError
							? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-tl-md'
							: 'message-assistant text-gray-100 rounded-tl-md'
				}`}
			>
				{isUser ? (
					<p className='whitespace-pre-wrap leading-relaxed'>
						{message.content}
					</p>
				) : (
					<div className='prose prose-invert max-w-none text-gray-100'>
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							components={markdownComponents}
						>
							{message.content}
						</ReactMarkdown>
					</div>
				)}
			</div>

			{/* User Avatar */}
			{isUser && (
				<div className='flex-shrink-0'>
					<div className='w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg'>
						<User size={18} className='text-white' />
					</div>
				</div>
			)}
		</div>
	)
})

Message.displayName = 'Message'

// Typing indicator component
const TypingIndicator = memo(() => (
	<div className='flex gap-3 md:gap-4 w-full justify-start animate-fade-in'>
		<div className='flex-shrink-0'>
			<div className='w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg'>
				<Bot size={18} className='text-white' />
			</div>
		</div>
		<div className='glass rounded-2xl rounded-tl-md px-5 py-4 flex items-center gap-1.5'>
			<div className='w-2 h-2 bg-blue-400 rounded-full animate-typing-dot' />
			<div
				className='w-2 h-2 bg-blue-400 rounded-full animate-typing-dot'
				style={{ animationDelay: '150ms' }}
			/>
			<div
				className='w-2 h-2 bg-blue-400 rounded-full animate-typing-dot'
				style={{ animationDelay: '300ms' }}
			/>
		</div>
	</div>
))

TypingIndicator.displayName = 'TypingIndicator'

// Main MessageList component
const MessageList = ({ messages, loading, scrollContainerRef }) => {
	const messagesEndRef = useRef(null)

	const scrollToBottom = useCallback(() => {
		if (scrollContainerRef?.current) {
			scrollContainerRef.current.scrollTop =
				scrollContainerRef.current.scrollHeight
		}
	}, [scrollContainerRef])

	useEffect(() => {
		scrollToBottom()
	}, [messages, loading, scrollToBottom])

	return (
		<div className='flex-1 custom-scrollbar px-4 py-6'>
			<div className='max-w-3xl mx-auto space-y-6'>
				{messages.map((msg, index) => (
					<Message
						key={`${msg.timestamp || index}-${index}`}
						message={msg}
						index={index}
					/>
				))}

				{loading && <TypingIndicator />}

				<div ref={messagesEndRef} className='h-4' />
			</div>
		</div>
	)
}

export default memo(MessageList)
