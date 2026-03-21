import { format } from 'date-fns';
import { motion } from 'framer-motion';
import type { Session } from '@workspace/api-client-react';

interface DrinkCardProps {
  session: Session;
  onClick: () => void;
  index: number;
}

export function DrinkCard({ session, onClick, index }: DrinkCardProps) {
  // If drink generation failed or hasn't happened yet, provide fallbacks
  const name = session.drinkName || "Mystery Concoction";
  const desc = session.drinkDescription || "A drink brewed from unresolved thoughts.";
  const emoji = session.drinkEmoji || "🥃";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={onClick}
      className="group cursor-pointer relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_8px_30px_rgba(217,119,6,0.15)] overflow-hidden"
    >
      {/* Paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none group-hover:opacity-20 transition-opacity"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}images/vintage-paper.png')`,
          backgroundSize: 'cover',
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
            {emoji}
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-sm border border-border/50">
            {format(new Date(session.createdAt), 'MMM d, yyyy')}
          </span>
        </div>

        <h3 className="font-display text-xl text-amber-100 mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        
        <p className="font-serif text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {desc}
        </p>

        <div className="pt-4 border-t border-border/50 flex justify-between items-center text-xs font-display tracking-widest text-primary/70">
          <span>{session.conversationTitle || 'Visit'}</span>
          <span className="group-hover:text-primary transition-colors">VIEW RECIPE &rarr;</span>
        </div>
      </div>
    </motion.div>
  );
}
