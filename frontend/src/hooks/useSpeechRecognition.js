import { useEffect, useState } from 'react'

const useSpeechRecognition = (langCode = 'en-US') => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  let recognition = null;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = langCode;
    recognition.interimResults = false;
  }

  useEffect(() => {
    if (recognition) {
       recognition.lang = langCode;
    }
  }, [langCode]);

  useEffect(() => {
    if (recognition) {
        setIsSupported(true);
    }
  }, []);

  const startListening = () => {
    if (!recognition) return;
    
    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    if (recognition) {
        recognition.stop();
        setIsListening(false);
    }
  };

  return {
    text,
    setText,
    isListening,
    startListening,
    stopListening,
    isSupported
  };
};

export default useSpeechRecognition;
