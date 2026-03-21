import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '@workspace/api-client-react';

interface RecipeModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeModal({ session, isOpen, onClose }: RecipeModalProps) {
  if (!session) return null;

  let ingredients: string[];
  try {
    ingredients = JSON.parse(session.drinkIngredients ?? '[]');
  } catch {
    ingredients = (session.drinkIngredients ?? '')
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
  }
  if (!ingredients.length) ingredients = ["A measure of unspoken thoughts"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#2a1f1a] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#4a3424] my-4 max-h-[88vh] overflow-y-auto"
          >
            {/* Paper Texture */}
            <div 
              className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none rounded-xl"
              style={{
                backgroundImage: `url('${import.meta.env.BASE_URL}images/vintage-paper.png')`,
                backgroundSize: 'cover',
              }}
            />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 text-[#a8896c] hover:text-amber-400 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black/40 border border-[#5c4028] text-3xl mb-3 shadow-inner">
                  {session.drinkEmoji || "🌿"}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl text-amber-500 mb-2 drop-shadow-md">
                  {session.drinkName || "Unnamed Remedy"}
                </h2>
                <div className="flex items-center justify-center gap-3 text-xs font-mono text-[#a8896c]">
                  <span>{format(new Date(session.createdAt), 'MMMM do, yyyy')}</span>
                  <span>&bull;</span>
                  <span>{session.conversationTitle || 'Saloon Visit'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5 text-center px-2 sm:px-8">
                <p className="font-serif text-sm sm:text-base leading-relaxed text-[#d4c3b3] italic">
                  "{session.drinkDescription || 'A remedy brewed from the echoes of a quiet saloon conversation.'}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#4a3424] pt-5">
                {/* What You Need */}
                <div>
                  <h3 className="font-display text-sm text-amber-600 tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-6 h-px bg-amber-600/50"></span>
                    WHAT YOU NEED
                  </h3>
                  <ul className="space-y-2">
                    {ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-serif text-sm text-[#d4c3b3]">
                        <span className="text-amber-700/50 mt-0.5">✦</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The Path Forward */}
                <div>
                  <h3 className="font-display text-sm text-amber-600 tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-6 h-px bg-amber-600/50"></span>
                    THE PATH FORWARD
                  </h3>
                  <p className="font-serif text-sm text-[#d4c3b3] leading-relaxed whitespace-pre-wrap">
                    {session.drinkInstructions || "Go easy on yourself, partner. One step at a time."}
                  </p>
                </div>
              </div>
              
              {/* Footer seal */}
              <div className="mt-6 text-center opacity-30">
                <div className="font-display text-lg">B.S.</div>
                <div className="text-xs tracking-[0.3em] mt-0.5 uppercase">Barty's Saloon</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
