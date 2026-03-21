import { motion, AnimatePresence } from 'framer-motion';
import { X, Wine } from 'lucide-react';
import { format } from 'date-fns';
import type { Session } from '@workspace/api-client-react';

interface RecipeModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeModal({ session, isOpen, onClose }: RecipeModalProps) {
  if (!session) return null;

  const ingredients = session.drinkIngredients ? session.drinkIngredients.split(',').map(i => i.trim()) : ["Unknown spirits"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
              className="relative w-full max-w-2xl bg-[#2a1f1a] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#4a3424] my-8"
            >
              {/* Paper Texture */}
              <div 
                className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none rounded-xl"
                style={{
                  backgroundImage: `url('${import.meta.env.BASE_URL}images/vintage-paper.png')`,
                  backgroundSize: 'cover',
                }}
              />

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 text-[#a8896c] hover:text-amber-400 hover:bg-black/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative z-10 p-8 sm:p-12">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-black/40 border border-[#5c4028] text-4xl mb-6 shadow-inner">
                    {session.drinkEmoji || <Wine className="w-10 h-10 text-amber-500" />}
                  </div>
                  <h2 className="font-display text-3xl sm:text-5xl text-amber-500 mb-4 drop-shadow-md">
                    {session.drinkName || "Mystery Concoction"}
                  </h2>
                  <div className="flex items-center justify-center gap-4 text-sm font-mono text-[#a8896c]">
                    <span>{format(new Date(session.createdAt), 'MMMM do, yyyy')}</span>
                    <span>&bull;</span>
                    <span>{session.conversationTitle || 'Saloon Visit'}</span>
                  </div>
                </div>

                {/* Story */}
                <div className="mb-10 text-center px-4 sm:px-12">
                  <p className="font-serif text-lg sm:text-xl leading-relaxed text-[#d4c3b3] italic">
                    "{session.drinkDescription || 'A drink brewed from the echoes of a quiet saloon conversation.'}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 border-t border-[#4a3424] pt-12">
                  {/* Ingredients */}
                  <div>
                    <h3 className="font-display text-xl text-amber-600 tracking-widest mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-amber-600/50"></span>
                      INGREDIENTS
                    </h3>
                    <ul className="space-y-4">
                      {ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-start gap-3 font-serif text-[#d4c3b3]">
                          <span className="text-amber-700/50 mt-1">✦</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h3 className="font-display text-xl text-amber-600 tracking-widest mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-amber-600/50"></span>
                      INSTRUCTIONS
                    </h3>
                    <p className="font-serif text-[#d4c3b3] leading-relaxed whitespace-pre-wrap">
                      {session.drinkInstructions || "Mix well and serve with a heavy heart."}
                    </p>
                  </div>
                </div>
                
                {/* Footer seal */}
                <div className="mt-16 text-center opacity-30">
                  <div className="font-display text-2xl">B.S.</div>
                  <div className="text-xs tracking-[0.3em] mt-1 uppercase">Barty's Saloon</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
