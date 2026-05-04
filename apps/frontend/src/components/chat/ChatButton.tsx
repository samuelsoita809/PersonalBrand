import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ChatButton: React.FC = () => {
  const { isChatOpen, toggleChat } = useChat();

  return (
    <button
      id="chat-toggle-button"
      onClick={toggleChat}
      className={`fixed bottom-6 right-6 z-[60] h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isChatOpen 
          ? 'w-14 bg-slate-800 text-white rotate-90' 
          : 'w-auto min-w-[3.5rem] px-2 bg-blue-600 text-white hover:bg-blue-500'
      }`}
      aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
    >
      {isChatOpen ? (
        <X size={28} className="animate-in fade-in zoom-in duration-300" />
      ) : (
        <div className="flex items-center gap-2 px-4">
          <span className="font-bold whitespace-nowrap hidden sm:inline animate-in slide-in-from-right-4 duration-500">Talk to Me</span>
          <MessageSquare size={28} className="animate-in fade-in zoom-in duration-300" />
        </div>
      )}
      
      {!isChatOpen && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
        </span>
      )}
    </button>
  );
};

export default ChatButton;
