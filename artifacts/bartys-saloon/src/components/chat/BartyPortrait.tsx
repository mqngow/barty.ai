import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface BartyPortraitProps {
  isSpeaking?: boolean;
}

const FADE_MS = 220;

export function BartyPortrait({ isSpeaking = false }: BartyPortraitProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (fadeRef.current) clearTimeout(fadeRef.current);
    setVisible(false);
    fadeRef.current = setTimeout(() => {
      setFrameIndex(isSpeaking ? 1 : 0);
      setVisible(true);
      fadeRef.current = null;
    }, FADE_MS);
    return () => { if (fadeRef.current) clearTimeout(fadeRef.current); };
  }, [isSpeaking]);

  const translateY = frameIndex === 0 ? '0%' : `${-(100 / 3)}%`;

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
              transform: `translateY(${translateY})`,
              opacity: visible ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
            draggable={false}
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent z-10 pointer-events-none" />
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
