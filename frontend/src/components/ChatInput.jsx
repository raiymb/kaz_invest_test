import { Loader2, Mic, MicOff, Send } from 'lucide-react'
import { memo, useCallback, useRef } from 'react'

const ChatInput = memo(
	({
		input,
		setInput,
		onSend,
		isListening,
		startListening,
		stopListening,
		isSpeechSupported,
		isLoading,
		t,
	}) => {
		const inputRef = useRef(null)

		const handleKeyDown = useCallback(
			e => {
				if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
					e.preventDefault()
					onSend()
				}
			},
			[onSend, isLoading],
		)

		const handleMicClick = useCallback(() => {
			if (isListening) {
				stopListening()
			} else {
				startListening()
			}
		}, [isListening, startListening, stopListening])

		const handleInputChange = useCallback(
			e => {
				setInput(e.target.value)
			},
			[setInput],
		)

		const canSend = input.trim() && !isLoading

		return (
			<div className='relative'>
				{/* Input Container */}
				<div
					className={`
          flex items-center w-full glass rounded-2xl px-3 py-2 md:px-4 md:py-3
          transition-all duration-300
          ${isLoading ? 'opacity-80' : ''}
          focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/30
        `}
				>
					{/* Microphone Button */}
					{isSpeechSupported && (
						<button
							onClick={handleMicClick}
							disabled={isLoading}
							className={`
              flex-shrink-0 p-2.5 rounded-xl transition-all duration-200
              ${
								isListening
									? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
									: 'text-gray-400 hover:text-white hover:bg-white/10'
							}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
							aria-label={
								isListening
									? t?.stopListening || 'Stop listening'
									: t?.startListening || 'Start voice input'
							}
						>
							{isListening ? <MicOff size={20} /> : <Mic size={20} />}
						</button>
					)}

					{/* Text Input */}
					<input
						ref={inputRef}
						type='text'
						value={input}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder={t?.placeholder || 'Type your message...'}
						disabled={isLoading}
						className={`
            flex-1 bg-transparent border-none outline-none
            text-white placeholder-gray-400
            text-base md:text-lg px-3 py-1
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
						aria-label={t?.placeholder || 'Type your message'}
					/>

					{/* Send Button */}
					<button
						onClick={onSend}
						disabled={!canSend}
						className={`
            flex-shrink-0 p-2.5 rounded-xl transition-all duration-200
            ${
							canSend
								? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
								: 'bg-white/5 text-gray-500 cursor-not-allowed'
						}
          `}
						aria-label={t?.send || 'Send message'}
					>
						{isLoading ? (
							<Loader2 size={20} className='animate-spin' />
						) : (
							<Send size={20} />
						)}
					</button>
				</div>

				{/* Voice Recording Indicator */}
				{isListening && (
					<div className='absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white text-sm rounded-full shadow-lg animate-fade-in'>
						<span className='w-2 h-2 bg-white rounded-full animate-pulse' />
						{t?.listening || 'Listening...'}
					</div>
				)}
			</div>
		)
	},
)

ChatInput.displayName = 'ChatInput'

export default ChatInput
