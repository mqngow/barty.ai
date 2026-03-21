import { motion } from 'framer-motion';

export function BartyPortrait() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* The Portrait Container */}
      <motion.div 
        className="relative w-full max-w-[400px] aspect-[4/5] rounded-xl overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-primary/5 animate-pulse-slow mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        
        {/* Placeholder Art Area */}
        <div className="absolute inset-2 border-2 border-dashed border-primary/40 rounded-lg flex flex-col items-center justify-center p-6 text-center animate-sway bg-black/40 backdrop-blur-[2px] transition-colors hover:bg-black/50">
          <div className="w-20 h-20 rounded-full border-2 border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(217,119,6,0.2)]">
            <span className="text-4xl">🤠</span>
          </div>
          <h3 className="font-display text-2xl text-primary/80 mb-2 tracking-widest uppercase">
            Barty's Portrait
          </h3>
          <p className="font-serif text-muted-foreground text-sm italic mb-4">
            Art Goes Here<br/>(400x500px min)
          </p>
          <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded text-xs text-primary/60 font-mono">
            Replace this container with final art
          </div>
        </div>
      </motion.div>

      {/* Barty's Nameplate */}
      <div className="mt-6 relative px-8 py-3 bg-card border border-border rounded-sm shadow-xl">
        <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-border" />
        <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-border" />
        <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-border" />
        <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-border" />
        
        <h2 className="font-display text-xl text-amber-100 tracking-widest">
          BARTY
        </h2>
      </div>
    </div>
  );
}
