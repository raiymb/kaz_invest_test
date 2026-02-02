import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ currentLang, setLang, exclude = [], inHeader = false }) => {
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'kk', label: 'KZ' },
  ].filter(l => !exclude.includes(l.code));

  return (
    <div className={`${inHeader ? 'flex' : 'absolute top-4 right-4'} items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10`}>
      <div className="p-2 text-blue-200">
        <Globe size={18} />
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLang(lang.code)}
          className={`px-3 py-1ounded-full text-sm font-medium transition-all rounded-full ${
            currentLang === lang.code
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-blue-100 hover:bg-white/5'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
