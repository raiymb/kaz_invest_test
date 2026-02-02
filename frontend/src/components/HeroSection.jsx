import { Code2, FileText, Lightbulb, MessageCircle, Zap } from 'lucide-react'

const quickActions = [
	{
		icon: Lightbulb,
		titleKey: 'quickExplain',
		prompt: 'Explain how artificial intelligence works in simple terms',
		gradient: 'from-amber-500 to-orange-500',
		bgGlow: 'bg-amber-500/20',
	},
	{
		icon: Code2,
		titleKey: 'quickCode',
		prompt: 'Write a Python function to sort a list of numbers',
		gradient: 'from-emerald-500 to-teal-500',
		bgGlow: 'bg-emerald-500/20',
	},
	{
		icon: FileText,
		titleKey: 'quickSummarize',
		prompt: 'Help me write a professional email to my manager',
		gradient: 'from-blue-500 to-indigo-500',
		bgGlow: 'bg-blue-500/20',
	},
	{
		icon: Zap,
		titleKey: 'quickIdeas',
		prompt: 'Give me 5 creative ideas for a mobile app startup',
		gradient: 'from-purple-500 to-pink-500',
		bgGlow: 'bg-purple-500/20',
	},
]

const defaultTitles = {
	quickExplain: 'Explain a concept',
	quickCode: 'Write code',
	quickSummarize: 'Help with writing',
	quickIdeas: 'Brainstorm ideas',
}

const HeroSection = ({ t, onQuickAction }) => {
	return (
		<div className='flex-1 flex flex-col items-center justify-center px-4 py-6 md:py-8 custom-scrollbar'>
			<div className='max-w-2xl w-full space-y-6 md:space-y-8 animate-fade-in'>
				<div className='text-center space-y-4'>
					<h1 className='text-4xl md:text-5xl font-bold gradient-text leading-tight'>
						{t?.greeting || 'Hello!'}
					</h1>
					<h2 className='text-xl md:text-2xl font-semibold text-blue-100 leading-tight'>
						{t?.prompt || 'What would you like to know?'}
					</h2>

					<p className='text-base md:text-lg text-blue-200/60 max-w-lg mx-auto leading-relaxed'>
						{t?.subtext ||
							'Choose a quick action below or type your own question to get started.'}
					</p>
				</div>

				{/* Quick Actions Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-4'>
					{quickActions.map((action, index) => {
						const Icon = action.icon
						const title = t?.[action.titleKey] || defaultTitles[action.titleKey]

						return (
							<button
								key={index}
								onClick={() => onQuickAction?.(action.prompt)}
								className='group relative flex items-center gap-4 p-4 rounded-2xl glass hover:bg-white/10 transition-all duration-300 text-left overflow-hidden'
								style={{ animationDelay: `${index * 100}ms` }}
							>
								{/* Background Glow on Hover */}
								<div
									className={`absolute inset-0 ${action.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}
								/>

								{/* Icon */}
								<div
									className={`relative flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
								>
									<Icon size={20} className='text-white' />
								</div>

								{/* Text */}
								<div className='relative flex-1 min-w-0'>
									<p className='font-medium text-white group-hover:text-white transition-colors truncate'>
										{title}
									</p>
									<p className='text-sm text-blue-200/50 group-hover:text-blue-200/70 transition-colors truncate'>
										{action.prompt.slice(0, 40)}...
									</p>
								</div>
							</button>
						)
					})}
				</div>

				{/* Helper Text */}
				<div className='flex items-center justify-center gap-2 text-blue-200/40 text-sm pt-4'>
					<MessageCircle size={16} />
					<span>{t?.helperText || 'Or type your message below'}</span>
				</div>
			</div>
		</div>
	)
}

export default HeroSection
