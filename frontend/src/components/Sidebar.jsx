import { MessageSquare, Plus, Trash2, X } from 'lucide-react';

const Sidebar = ({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-[#0d2136]/90 backdrop-blur-xl border-r border-white/10 z-50 
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}>
        <div className="flex flex-col h-full p-4">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2 text-blue-100 font-semibold">
              <MessageSquare size={20} />
              <span>History</span>
            </div>
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* New Chat Button (Sidebar version) */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex items-center justify-center space-x-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 mb-6 font-medium"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                No history yet
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center justify-between p-3.5 mx-2 rounded-xl transition-all cursor-pointer border border-transparent ${
                    session.id === currentSessionId
                      ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-100 shadow-sm'
                      : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                >
                  <div className="truncate text-sm flex-1 mr-2">
                    {session.title || 'New Conversation'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {/* Footer Info */}
          <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500 text-center">
            AI Chat v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
