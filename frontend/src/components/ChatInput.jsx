import { Mic, MicOff, Send } from 'lucide-react';
import { useRef } from 'react';

const ChatInput = ({ input, setInput, onSend, isListening, startListening, stopListening, isSpeechSupported, t }) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex w-full max-w-2xl items-center bg-[#1e40af] bg-opacity-30 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 shadow-lg transition-all focus-within:ring-2 focus-within:ring-blue-400">
      
      {/* Microphone Button */}
      {isSpeechSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          className={`p-2 rounded-full transition-colors ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-300 hover:text-white'
          }`}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      )}

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t && t.placeholder ? t.placeholder : "Ask whatever you want"}
        className="flex-1 bg-transparent border-none outline-none text-white px-4 placeholder-gray-300 text-lg"
      />

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={!input.trim()}
        className={`p-2 rounded-full transition-all ${
          input.trim() 
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md' 
            : 'bg-white/10 text-gray-400 cursor-not-allowed'
        }`}
      >
        <Send size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
