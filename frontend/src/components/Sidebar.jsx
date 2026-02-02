import { Clock, MessageSquare, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { memo, useCallback } from 'react'

const SessionItem = memo(({ session, isActive, onSelect, onDelete }) => {
	const handleDelete = useCallback(
		e => {
			e.stopPropagation()
			onDelete(session.id)
		},
		[onDelete, session.id],
	)

	const handleSelect = useCallback(() => {
		onSelect(session.id)
	}, [onSelect, session.id])

	// Format relative time
	const getRelativeTime = dateString => {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now - date
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 1) return 'Just now'
		if (diffMins < 60) return `${diffMins}m ago`
		if (diffHours < 24) return `${diffHours}h ago`
		if (diffDays < 7) return `${diffDays}d ago`
		return date.toLocaleDateString()
	}

	return (
		<button
			onClick={handleSelect}
			className={`
        group w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left
        ${
					isActive
						? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 shadow-sm'
						: 'hover:bg-white/5 border border-transparent'
				}
      `}
		>
			{/* Icon */}
			<div
				className={`
        flex-shrink-0 p-2 rounded-lg transition-colors
        ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500 group-hover:text-gray-400'}
      `}
			>
				<MessageSquare size={16} />
			</div>

			{/* Content */}
			<div className='flex-1 min-w-0'>
				<p
					className={`text-sm font-medium truncate ${isActive ? 'text-blue-100' : 'text-gray-300 group-hover:text-white'}`}
				>
					{session.title || 'New Chat'}
				</p>
				<p className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
					<Clock size={10} />
					{getRelativeTime(session.createdAt)}
				</p>
			</div>

			{/* Delete Button */}
			<button
				onClick={handleDelete}
				className='flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all'
				aria-label='Delete conversation'
			>
				<Trash2 size={14} />
			</button>
		</button>
	)
})

SessionItem.displayName = 'SessionItem'

const Sidebar = ({
	sessions,
	currentSessionId,
	onSelectSession,
	onNewChat,
	onDeleteSession,
	isOpen,
	onClose,
	t,
}) => {
	const handleNewChat = useCallback(() => {
		onNewChat()
		if (window.innerWidth < 768) onClose()
	}, [onNewChat, onClose])

	const handleSelectSession = useCallback(
		id => {
			onSelectSession(id)
			if (window.innerWidth < 768) onClose()
		},
		[onSelectSession, onClose],
	)

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden'
					onClick={onClose}
					aria-hidden='true'
				/>
			)}

			{/* Sidebar Container */}
			<aside
				className={`
          fixed top-0 left-0 h-full w-72 z-50
          glass-strong border-r border-white/10 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block
        `}
				aria-label='Chat history sidebar'
			>
				<div className='flex flex-col h-full'>
					{/* Header */}
					<div className='flex items-center justify-between p-4 border-b border-white/5'>
						<div className='flex items-center gap-2.5'>
							<div className='p-2 bg-blue-500/10 rounded-lg'>
								<Sparkles size={18} className='text-blue-400' />
							</div>
							<span className='font-semibold text-white'>
								{t?.history || 'Chat History'}
							</span>
						</div>
						<button
							onClick={onClose}
							className='md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors'
							aria-label='Close sidebar'
						>
							<X size={20} />
						</button>
					</div>

					{/* New Chat Button */}
					<div className='p-4'>
						<button
							onClick={handleNewChat}
							className='flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 font-medium group'
						>
							<Plus
								size={18}
								className='group-hover:rotate-90 transition-transform duration-300'
							/>
							<span>{t?.newChat || 'New Chat'}</span>
						</button>
					</div>

					{/* Session List */}
					<div className='flex-1 overflow-y-auto custom-scrollbar px-3 pb-4'>
						{sessions.length === 0 ? (
							<div className='flex flex-col items-center justify-center py-12 text-center'>
								<div className='p-4 bg-white/5 rounded-2xl mb-4'>
									<MessageSquare size={28} className='text-gray-500' />
								</div>
								<p className='text-gray-500 text-sm'>
									{t?.noHistory || 'No conversations yet'}
								</p>
								<p className='text-gray-600 text-xs mt-1'>
									{t?.startChat || 'Start a new chat to begin'}
								</p>
							</div>
						) : (
							<div className='space-y-1.5'>
								{sessions.map(session => (
									<SessionItem
										key={session.id}
										session={session}
										isActive={session.id === currentSessionId}
										onSelect={handleSelectSession}
										onDelete={onDeleteSession}
									/>
								))}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className='p-4 border-t border-white/5'>
						<p className='text-xs text-gray-500 text-center'>
							AI Assistant v2.0
						</p>
					</div>
				</div>
			</aside>
		</>
	)
}

export default memo(Sidebar)
