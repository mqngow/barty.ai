import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GeminiMessage } from '@workspace/api-client-react';

interface MessageBubbleProps {
  message: Partial<GeminiMessage> & { content: string, role: string };
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isBarty = message.role === 'model' || message.role === 'assistant';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full mb-6",
        isBarty ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[75%] p-5 shadow-lg relative",
          isBarty 
            ? "bg-card/90 border border-primary/20 rounded-2xl rounded-tl-sm text-amber-50" 
            : "bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tr-sm text-zinc-100"
        )}
      >
        {isBarty && (
          <div className="absolute -top-3 -left-2 text-2xl drop-shadow-md">
            🍺
          </div>
        )}
        
        <div className="font-serif leading-relaxed text-base whitespace-pre-wrap">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary/80 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
