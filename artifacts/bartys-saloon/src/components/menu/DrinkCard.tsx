import { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { Session } from '@workspace/api-client-react';

interface DrinkCardProps {
  session: Session;
  onClick: () => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  index: number;
}

export function DrinkCard({ session, onClick, onDelete, isDeleting = false, index }: DrinkCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const name = session.drinkName || "Unnamed Remedy";
  const desc = session.drinkDescription || "A remedy brewed from unresolved thoughts.";
  const emoji = session.drinkEmoji || "🌿";

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmOpen(true);
  }

  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmOpen(false);
    onDelete(session.id);
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmOpen(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onClick={onClick}
      className="group cursor-pointer relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_8px_30px_rgba(217,119,6,0.15)] overflow-hidden"
    >
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded-sm border border-border/50">
              {format(new Date(session.createdAt), 'MMM d, yyyy')}
            </span>
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-1.5 rounded-sm border border-border/50 bg-background text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete remedy"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="font-display text-xl text-amber-100 mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        
        <p className="font-serif text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {desc}
        </p>

        <div className="pt-4 border-t border-border/50 flex justify-between items-center text-xs font-display tracking-widest text-primary/70">
          <span>{session.conversationTitle || 'Visit'}</span>
          <span className="group-hover:text-primary transition-colors">VIEW REMEDY &rarr;</span>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm rounded-xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-serif text-amber-100 text-center mb-1 text-base">Remove this remedy?</p>
          <p className="font-serif text-muted-foreground text-center mb-6 text-sm">This cannot be undone, partner.</p>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-display tracking-wide border border-border rounded-lg text-muted-foreground hover:text-amber-100 hover:border-border/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep it
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-display tracking-wide bg-destructive/10 border border-destructive/40 rounded-lg text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Removing...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
