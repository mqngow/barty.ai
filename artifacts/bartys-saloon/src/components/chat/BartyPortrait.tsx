import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type MouthFrame = 'idle' | 'talking-mid' | 'talking-open';

interface BartyPortraitProps {
  isSpeaking?: boolean;
}

const MOUTH_FRAMES: MouthFrame[] = ['idle', 'talking-mid', 'talking-open', 'talking-mid'];
const FRAME_INTERVAL_MS = 450;
const CROSSFADE_DURATION_MS = 150;

const FRAME_OFFSET: Record<MouthFrame, number> = {
  'idle': 0,
  'talking-mid': 1,
  'talking-open': 2,
};

export function BartyPortrait({ isSpeaking = false }: BartyPortraitProps) {
  const [currentFrame, setCurrentFrame] = useState<MouthFrame>('idle');
  const [nextFrame, setNextFrame] = useState<MouthFrame>('idle');
  const [crossfading, setCrossfading] = useState(false);
  const frameIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFade = (toFrame: MouthFrame) => {
    if (fadeTimeoutRef.current) { clearTimeout(fadeTimeoutRef.current); fadeTimeoutRef.current = null; }
    setNextFrame(toFrame);
    setCrossfading(true);
    fadeTimeoutRef.current = setTimeout(() => {
      setCurrentFrame(toFrame);
      setCrossfading(false);
      fadeTimeoutRef.current = null;
    }, CROSSFADE_DURATION_MS);
  };

  useEffect(() => {
    if (isSpeaking) {
      intervalRef.current = setInterval(() => {
        frameIndexRef.current = (frameIndexRef.current + 1) % MOUTH_FRAMES.length;
        scheduleFade(MOUTH_FRAMES[frameIndexRef.current]);
      }, FRAME_INTERVAL_MS);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      frameIndexRef.current = 0;
      scheduleFade('idle');
    }
    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (fadeTimeoutRef.current) { clearTimeout(fadeTimeoutRef.current); fadeTimeoutRef.current = null; }
    };
  }, [isSpeaking]);

  const currentOffset = FRAME_OFFSET[currentFrame];
  const nextOffset = FRAME_OFFSET[nextFrame];

  const translateYCurrent = -(currentOffset * (100 / 3));
  const translateYNext = -(nextOffset * (100 / 3));

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
              transform: `translateY(${translateYCurrent}%)`,
              opacity: crossfading ? 0 : 1,
              transition: `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`,
            }}
            draggable={false}
          />
          <img
            src="/images/barty-portrait.png"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '300%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transform: `translateY(${translateYNext}%)`,
              opacity: crossfading ? 1 : 0,
              transition: `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`,
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
