import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type MouthFrame = 'idle' | 'talking-mid' | 'talking-open';

interface BartyPortraitProps {
  isSpeaking?: boolean;
}

const MOUTH_FRAMES: MouthFrame[] = ['idle', 'talking-mid', 'talking-open', 'talking-mid'];
const FRAME_INTERVAL_MS = 160;

const FRAME_OFFSET: Record<MouthFrame, number> = {
  'idle': 0,
  'talking-mid': 1,
  'talking-open': 2,
};

export function BartyPortrait({ isSpeaking = false }: BartyPortraitProps) {
  const [mouthFrame, setMouthFrame] = useState<MouthFrame>('idle');
  const frameIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpeaking) {
      intervalRef.current = setInterval(() => {
        frameIndexRef.current = (frameIndexRef.current + 1) % MOUTH_FRAMES.length;
        setMouthFrame(MOUTH_FRAMES[frameIndexRef.current]);
      }, FRAME_INTERVAL_MS);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      frameIndexRef.current = 0;
      setMouthFrame('idle');
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [isSpeaking]);

  const panelIndex = FRAME_OFFSET[mouthFrame];
  const translateY = -(panelIndex * (100 / 3));

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        className="relative w-full max-w-[300px] aspect-[4/5] rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          animate={{ rotate: [-0.4, 0.4, -0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full relative overflow-hidden"
        >
          <img
            src="/images/barty-portrait.png"
            alt="Barty"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '300%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transform: `translateY(${translateY}%)`,
              transition: 'transform 0.05s linear',
            }}
            draggable={false}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
      </motion.div>

      <div className="mt-4 relative px-8 py-3 bg-card border border-border rounded-sm shadow-xl">
        <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-border" />
        <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-border" />
        <div className="absolute bottom-1 left-2 w-1.5 h-1.5 rounded-full bg-border" />
        <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-border" />
        <h2 className="font-display text-xl text-amber-100 tracking-widest">BARTY</h2>
      </div>
    </div>
  );
}
