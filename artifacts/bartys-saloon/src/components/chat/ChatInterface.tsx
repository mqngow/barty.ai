import { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { useBartyChat } from '@/hooks/use-barty-chat';
import { useListGeminiMessages } from '@workspace/api-client-react';
import { MessageBubble } from './MessageBubble';
import { useAppStore } from '@/store/use-app-store';

export function ChatInterface({ conversationId }: { conversationId: number }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useListGeminiMessages(conversationId, {
    query: { refetchInterval: 5000 }
  });
  
  const { 
    sendMessage, 
    isStreaming, 
    streamedText, 
    optimisticUserMessage,
    isUpdatingRemedy,
  } = useBartyChat(conversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText, optimisticUserMessage]);

  const startNewChat = useAppStore(state => state.startNewChat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] lg:h-[700px] bg-background/50 border border-border/50 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <h3 className="font-display text-lg text-amber-100/80">Conversation</h3>
        <div className="flex items-center gap-3">
          {isUpdatingRemedy && (
            <span className="text-xs font-serif text-amber-600/60 italic animate-pulse">
              Barty's stirring your remedy…
            </span>
          )}
          <button
            onClick={startNewChat}
            disabled={isStreaming}
            title="Start a new visit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider text-muted-foreground border border-border/50 hover:text-amber-200 hover:border-primary/40 hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Visit
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth"
      >
        {messages.length === 0 && !optimisticUserMessage && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="text-4xl mb-4">🪑</div>
            <p className="font-serif text-lg">Pull up a stool and tell Barty what's on your mind.</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {optimisticUserMessage && (
          <MessageBubble message={{ role: 'user', content: optimisticUserMessage }} />
        )}

        {isStreaming && (
          <MessageBubble 
            message={{ role: 'model', content: streamedText || '...' }} 
            isStreaming={true} 
          />
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card/90 border-t border-border/50 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Tell Barty your troubles..."
            className="w-full bg-background border border-border rounded-xl py-4 pl-4 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none font-serif text-lg max-h-32"
            rows={1}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 bottom-2 p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(217,119,6,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2 font-sans opacity-60">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
