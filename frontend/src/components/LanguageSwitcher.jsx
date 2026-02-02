import { Globe } from 'lucide-react'
import { memo, useCallback } from 'react'

const languages = [
	{ code: 'en', label: 'EN', fullName: 'English' },
	{ code: 'ru', label: 'RU', fullName: 'Русский' },
	{ code: 'kk', label: 'KZ', fullName: 'Қазақша' },
]

const LanguageSwitcher = memo(({ currentLang, setLang, exclude = [] }) => {
	const availableLanguages = languages.filter(l => !exclude.includes(l.code))

	const handleLangChange = useCallback(
		code => {
			setLang(code)
		},
		[setLang],
	)

	return (
		<div
			className='flex items-center glass rounded-xl p-1'
			role='group'
			aria-label='Language selection'
		>
			<div className='p-2 text-blue-300'>
				<Globe size={16} />
			</div>
			{availableLanguages.map(lang => (
				<button
					key={lang.code}
					onClick={() => handleLangChange(lang.code)}
					className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
							currentLang === lang.code
								? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
								: 'text-gray-300 hover:text-white hover:bg-white/10'
						}
          `}
					aria-label={lang.fullName}
					aria-pressed={currentLang === lang.code}
				>
					{lang.label}
				</button>
			))}
		</div>
	)
})

LanguageSwitcher.displayName = 'LanguageSwitcher'

export default LanguageSwitcher
