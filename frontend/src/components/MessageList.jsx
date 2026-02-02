import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const MessageList = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 w-full flex flex-col space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar px-2 pb-32">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl backdrop-blur-sm shadow-md transition-all ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm shadow-blue-500/20'
                : 'bg-white/5 text-gray-100 rounded-tl-sm border border-white/10 hover:bg-white/10'
            }`}
          >
            {msg.role === 'user' ? (
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            ) : (
              <div className="prose prose-invert max-w-none text-gray-100 prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:p-0">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-300 hover:text-blue-200 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    code: ({node, inline, className, children, ...props}) => {
                      return inline ? (
                        <code className="bg-black/30 px-1 py-0.5 rounded text-sm text-blue-200 font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <div className="bg-black/30 rounded-lg p-3 my-2 overflow-x-auto border border-white/10">
                          <code className="text-sm font-mono text-gray-200 block" {...props}>
                            {children}
                          </code>
                        </div>
                      );
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex justify-start w-full">
           <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center space-x-2">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
           </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
