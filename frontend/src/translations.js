export const translations = {
  en: {
    greeting: "Hi there!",
    prompt: "What would you like to know?",
    subtext: "Use one of the most common prompts below or ask your own question to get started.",
    placeholder: "Ask whatever you want",
    voiceError: "Voice recognition not supported or permission denied.",
    error: "Sorry, something went wrong. Please try again."
  },
  ru: {
    greeting: "Привет!",
    prompt: "Что бы вы хотели узнать?",
    subtext: "Используйте один из популярных запросов ниже или задайте свой вопрос.",
    placeholder: "Спросите что угодно",
    voiceError: "Голосовой ввод не поддерживается или нет доступа.",
    error: "Извините, что-то пошло не так. Попробуйте снова."
  },
  kk: {
    greeting: "Сәлем!",
    prompt: "Не білгіңіз келеді?",
    subtext: "Төмендегі танымал сұраулардың бірін таңдаңыз немесе өз сұрағыңызды қойыңыз.",
    placeholder: "Кез келген нәрсені сұраңыз",
    voiceError: "Дауыспен енгізуге қолдау жоқ немесе рұқсат берілмеген.",
    error: "Кешіріңіз, қате кетті. Қайта көріңіз."
  }
};

export const languageOptions = [
  { code: 'en', label: 'English', voice: 'en-US' },
  { code: 'ru', label: 'Русский', voice: 'ru-RU' },
  { code: 'kk', label: 'Қазақша', voice: 'kk-KZ' } // Kazakh voice support might vary by browser
];
