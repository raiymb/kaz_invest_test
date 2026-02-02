import { Menu, MessageSquare, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ChatInput from './components/ChatInput'
import HeroSection from './components/HeroSection'
import LanguageSwitcher from './components/LanguageSwitcher'
import MessageList from './components/MessageList'
import Sidebar from './components/Sidebar'
import useSpeechRecognition from './hooks/useSpeechRecognition'
import { sendMessageToAI } from './services/chatService'
import { languageOptions, translations } from './translations'

function App() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    return localStorage.getItem('current_session_id') || null;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }
    const session = sessions.find(s => s.id === currentSessionId);
    setMessages(session ? session.messages : []);
  }, [currentSessionId, sessions]);

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('current_session_id', currentSessionId);
    } else {
      localStorage.removeItem('current_session_id');
    }
  }, [currentSessionId]);


  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const currentT = translations[lang];
  const currentVoice = languageOptions.find(opt => opt.code === lang)?.voice || 'en-US';

  const { 
    text: speechText, 
    startListening, 
    stopListening, 
    isListening, 
    isSupported, 
    setText: setSpeechText 
  } = useSpeechRecognition(currentVoice);

  useEffect(() => {
    if (speechText) setInput(speechText);
  }, [speechText]);


  const createNewSession = () => {
    const newSession = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const updateSessionMessages = (sessionId, newMessages) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        let title = session.title;
        if (session.title === 'New Chat' && newMessages.length > 0) {
          title = newMessages[0].content.slice(0, 30) + (newMessages[0].content.length > 30 ? '...' : '');
        }
        return { ...session, messages: newMessages, title };
      }
      return session;
    }));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let activeId = currentSessionId;
    if (!activeId) {
      activeId = createNewSession();
    }

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    updateSessionMessages(activeId, updatedMessages);
    
    setInput('');
    setSpeechText(''); 
    setLoading(true);

    try {
      const reply = await sendMessageToAI(userMessage.content);
      const botMessage = { role: 'assistant', content: reply };
      const finalMessages = [...updatedMessages, botMessage];
      
      setMessages(finalMessages);
      updateSessionMessages(activeId, finalMessages);
    } catch (error) {
      const errorMessage = { role: 'assistant', content: currentT.error };
      const failedMessages = [...updatedMessages, errorMessage];
      setMessages(failedMessages);
      updateSessionMessages(activeId, failedMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setInput('');
    setSpeechText('');
    setLoading(false);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDeleteSession = (id) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) {
      setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null);
    }
  };


  return (
    <div className="flex h-screen bg-[#0d2847] text-white font-sans overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative w-full h-full transition-all duration-300">
        
        <div className="absolute top-0 left-0 w-full z-30 flex justify-between items-center px-4 md:px-6 py-4 bg-[#0d2847]/80 backdrop-blur-md border-b border-white/5">
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className={`flex items-center space-x-2 ${sidebarOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'} transition-opacity`}>
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                <MessageSquare size={24} className="text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">AI Chat</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
             {/* New Chat (Header version - mostly for mobile or quick access) */}
             <button 
               onClick={handleNewChat}
               className="md:hidden flex items-center justify-center p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
             >
               <PlusCircle size={20} />
             </button>

             <LanguageSwitcher currentLang={lang} setLang={setLang} inHeader={true} />
          </div>
        </div>

        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col relative pt-20 pb-4 overflow-hidden">
          {(!currentSessionId || messages.length === 0) ? (
             <div className="flex-1 flex items-center justify-center p-4">
                <HeroSection t={currentT} />
             </div>
          ) : (
            <MessageList messages={messages} loading={loading} />
          )}
        </div>
      
        <div className="w-full bg-gradient-to-t from-[#0d2847] via-[#0d2847]/95 to-transparent pt-12 pb-8 px-4 z-40 max-w-5xl mx-auto shrink-0 pointer-events-none sticky bottom-0">
           <div className="pointer-events-auto">
           <ChatInput
              input={input}
              setInput={setInput}
              onSend={handleSend}
              isListening={isListening}
              startListening={startListening}
              stopListening={stopListening}
              isSpeechSupported={isSupported}
              t={currentT}
           />
        </div>

      </div>
    </div>
    </div>
  );
}

export default App;
