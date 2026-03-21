import { useState, useRef, useEffect } from 'react';
import { Send, GlassWater } from 'lucide-react';
import { useBartyChat } from '@/hooks/use-barty-chat';
import { useListGeminiMessages } from '@workspace/api-client-react';
import { MessageBubble } from './MessageBubble';
import { useLocation } from 'wouter';

export function ChatInterface({ conversationId }: { conversationId: number }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const { data: messages = [] } = useListGeminiMessages(conversationId, {
    query: { refetchInterval: 5000 } // Poll occasionally just in case
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  const { 
    sendMessage, 
    isStreaming, 
    streamedText, 
    optimisticUserMessage 
  } = useBartyChat(conversationId);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText, optimisticUserMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleLastCall = async () => {
    if (!conversationId || isGenerating || isStreaming) return;
    setIsGenerating(true);
    try {
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId }),
      });
      if (!sessionRes.ok) throw new Error('Failed to create session');
      const session = await sessionRes.json();

      const drinkRes = await fetch(`/api/sessions/${session.id}/generate-drink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!drinkRes.ok) throw new Error('Failed to generate drink');

      setLocation('/menu');
    } catch (err) {
      console.error("Failed to generate drink:", err);
      alert("Barty couldn't figure out the recipe right now. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full h-[600px] lg:h-[700px] bg-background/50 border border-border/50 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Top Bar for Chat */}
      <div className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 z-10">
        <h3 className="font-display text-lg text-amber-100/80">Conversation Tab</h3>
        <button
          onClick={handleLastCall}
          disabled={isGenerating || isStreaming || messages.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(217,119,6,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-display tracking-wider text-sm"
        >
          <GlassWater className="w-4 h-4" />
          {isGenerating ? "Mixing..." : "Last Call (Get Drink)"}
        </button>
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
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
