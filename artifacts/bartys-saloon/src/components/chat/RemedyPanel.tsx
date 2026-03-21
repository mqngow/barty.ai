import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';

export function RemedyPanel() {
  const remedy = useAppStore(state => state.currentRemedy);
  const isUpdating = useAppStore(state => state.isUpdatingRemedy);

  return (
    <AnimatePresence mode="wait">
      {remedy ? (
        <motion.div
          key="remedy"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.5 }}
          className="relative bg-card border border-border/60 rounded-2xl overflow-hidden shadow-xl"
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 24px,
                rgba(180,140,80,0.3) 24px,
                rgba(180,140,80,0.3) 25px
              )`,
            }}
          />

          <div className="relative z-10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-amber-500/70" />
                <span className="font-display text-xs tracking-[0.2em] text-amber-500/70 uppercase">
                  Barty's Remedy
                </span>
              </div>
              {isUpdating && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-xs font-sans text-amber-600/60 italic"
                >
                  Stirring…
                </motion.div>
              )}
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="text-3xl leading-none mt-0.5 flex-shrink-0">{remedy.emoji}</div>
              <h3 className="font-display text-lg text-amber-100 leading-tight">{remedy.name}</h3>
            </div>

            <p className="font-serif text-sm text-muted-foreground leading-relaxed mb-5 italic border-l-2 border-amber-700/30 pl-3">
              "{remedy.description}"
            </p>

            <div className="mb-4">
              <h4 className="font-display text-xs tracking-widest text-amber-600/70 uppercase mb-2">
                What You Need
              </h4>
              <ul className="space-y-1.5">
                {remedy.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 font-serif text-xs text-foreground/80">
                    <span className="text-amber-700/50 mt-0.5 flex-shrink-0">✦</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-border/40">
              <h4 className="font-display text-xs tracking-widest text-amber-600/70 uppercase mb-2">
                The Path Forward
              </h4>
              <p className="font-serif text-xs text-foreground/70 leading-relaxed">
                {remedy.instructions}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-card/40 border border-dashed border-border/40 rounded-2xl p-6 text-center"
        >
          {isUpdating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="text-3xl mb-2 inline-block"
              >
                🌿
              </motion.div>
              <p className="font-serif text-xs text-muted-foreground/60 italic">
                Barty's mixing your remedy…
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2 opacity-30">🌿</div>
              <p className="font-serif text-xs text-muted-foreground/60 italic">
                Barty'll mix up a remedy<br />once you've had a good talk.
              </p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
