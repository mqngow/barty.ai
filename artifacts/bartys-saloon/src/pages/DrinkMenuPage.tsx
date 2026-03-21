import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DrinkCard } from '@/components/menu/DrinkCard';
import { RecipeModal } from '@/components/menu/RecipeModal';
import { useListSessions } from '@workspace/api-client-react';
import type { Session } from '@workspace/api-client-react';
import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DrinkMenuPage() {
  const { data: sessions = [], isLoading } = useListSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const remedyLog = sessions.filter(s => s.drinkName);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto w-full pb-16">
        
        <div className="text-center mb-16 pt-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 rounded-full bg-card border border-border shadow-lg mb-6"
          >
            <Leaf className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl text-amber-50 mb-4"
          >
            The Remedy Log
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Every soul that's sat at this bar has walked away with something — a summary of their trouble and a path through it. Click a card to read yours.
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : remedyLog.length === 0 ? (
          <div className="text-center bg-card/50 border border-border/50 rounded-2xl p-12 backdrop-blur-sm">
            <div className="text-6xl mb-4 opacity-50">🕸️</div>
            <h3 className="font-display text-2xl text-amber-100/70 mb-2">The log is empty</h3>
            <p className="font-serif text-muted-foreground">Go belly up to the bar and have a chat with Barty first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remedyLog.map((session, i) => (
              <DrinkCard 
                key={session.id} 
                session={session} 
                index={i}
                onClick={() => setSelectedSession(session)} 
              />
            ))}
          </div>
        )}

      </div>

      <RecipeModal 
        session={selectedSession} 
        isOpen={!!selectedSession} 
        onClose={() => setSelectedSession(null)} 
      />
    </AppLayout>
  );
}
