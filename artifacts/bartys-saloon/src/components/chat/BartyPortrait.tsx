import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type MouthFrame = 'idle' | 'talking-mid' | 'talking-open';

interface BartyPortraitProps {
  isSpeaking?: boolean;
}

const MOUTH_FRAMES: MouthFrame[] = ['idle', 'talking-mid', 'talking-open'];
const FRAME_INTERVAL_MS = 180;

function BartyMouth({ frame }: { frame: MouthFrame }) {
  if (frame === 'idle') {
    return (
      <g>
        <rect x="82" y="172" width="4" height="4" fill="#8B4513" />
        <rect x="86" y="174" width="4" height="2" fill="#8B4513" />
        <rect x="90" y="174" width="4" height="2" fill="#8B4513" />
        <rect x="94" y="174" width="4" height="2" fill="#8B4513" />
        <rect x="98" y="172" width="4" height="4" fill="#8B4513" />
        <rect x="86" y="174" width="12" height="2" fill="#C1856A" />
      </g>
    );
  }
  if (frame === 'talking-mid') {
    return (
      <g>
        <rect x="82" y="170" width="4" height="4" fill="#8B4513" />
        <rect x="86" y="172" width="16" height="2" fill="#8B4513" />
        <rect x="98" y="170" width="4" height="4" fill="#8B4513" />
        <rect x="86" y="174" width="16" height="4" fill="#1a0a00" />
        <rect x="88" y="176" width="12" height="2" fill="#D2714A" />
        <rect x="90" y="174" width="8" height="2" fill="#E8C4A0" />
      </g>
    );
  }
  return (
    <g>
      <rect x="82" y="168" width="4" height="4" fill="#8B4513" />
      <rect x="86" y="170" width="16" height="2" fill="#8B4513" />
      <rect x="98" y="168" width="4" height="4" fill="#8B4513" />
      <rect x="86" y="172" width="16" height="8" fill="#1a0a00" />
      <rect x="88" y="172" width="12" height="2" fill="#E8C4A0" />
      <rect x="88" y="176" width="12" height="2" fill="#D2714A" />
      <rect x="90" y="174" width="4" height="2" fill="#FAFAFA" />
      <rect x="94" y="174" width="4" height="2" fill="#FAFAFA" />
    </g>
  );
}

export function BartyPortrait({ isSpeaking = false }: BartyPortraitProps) {
  const [mouthFrame, setMouthFrame] = useState<MouthFrame>('idle');
  const [blinkOn, setBlinkOn] = useState(false);
  const frameIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpeaking) {
      intervalRef.current = setInterval(() => {
        frameIndexRef.current = (frameIndexRef.current + 1) % MOUTH_FRAMES.length;
        setMouthFrame(MOUTH_FRAMES[frameIndexRef.current]);
      }, FRAME_INTERVAL_MS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      frameIndexRef.current = 0;
      setMouthFrame('idle');
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSpeaking]);

  useEffect(() => {
    const blinkLoop = () => {
      const delay = 2500 + Math.random() * 2000;
      return setTimeout(() => {
        setBlinkOn(true);
        setTimeout(() => {
          setBlinkOn(false);
          blinkTimeoutRef.current = blinkLoop();
        }, 120);
      }, delay);
    };
    const blinkTimeoutRef = { current: blinkLoop() };
    return () => clearTimeout(blinkTimeoutRef.current);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        className="relative w-full max-w-[320px] aspect-[4/5] rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          animate={{ rotate: [-0.5, 0.5, -0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          <svg
            viewBox="0 0 200 250"
            xmlns="http://www.w3.org/2000/svg"
            style={{ imageRendering: 'pixelated', width: '100%', height: '100%', display: 'block' }}
          >
            <rect width="200" height="250" fill="#1C0F02" />

            <rect x="0" y="0" width="200" height="250" fill="#1C0F02" />
            <rect x="20" y="180" width="160" height="70" fill="#2A1508" />

            <rect x="58" y="40" width="84" height="8" fill="#5C3317" />
            <rect x="52" y="48" width="96" height="8" fill="#6B3E1E" />
            <rect x="48" y="56" width="8" height="8" fill="#6B3E1E" />
            <rect x="56" y="56" width="88" height="4" fill="#7A4A28" />
            <rect x="144" y="56" width="8" height="8" fill="#6B3E1E" />

            <rect x="44" y="64" width="8" height="8" fill="#8B5E3C" />
            <rect x="52" y="60" width="96" height="4" fill="#7A4A28" />
            <rect x="148" y="64" width="8" height="8" fill="#8B5E3C" />

            <rect x="60" y="48" width="8" height="40" fill="#5C3317" />
            <rect x="56" y="44" width="8" height="36" fill="#6B3E1E" />
            <rect x="132" y="48" width="8" height="40" fill="#5C3317" />
            <rect x="136" y="44" width="8" height="36" fill="#6B3E1E" />

            <rect x="44" y="68" width="112" height="100" fill="#D4956A" />
            <rect x="40" y="72" width="4" height="88" fill="#C98B60" />
            <rect x="156" y="72" width="4" height="88" fill="#C98B60" />
            <rect x="44" y="160" width="112" height="8" fill="#C98B60" />

            <rect x="48" y="68" width="4" height="4" fill="#C98B60" />
            <rect x="148" y="68" width="4" height="4" fill="#C98B60" />
            <rect x="48" y="156" width="4" height="4" fill="#C98B60" />
            <rect x="148" y="156" width="4" height="4" fill="#C98B60" />

            <rect x="44" y="72" width="4" height="8" fill="#8B4513" />
            <rect x="48" y="68" width="4" height="4" fill="#8B4513" />
            <rect x="152" y="72" width="4" height="8" fill="#8B4513" />
            <rect x="148" y="68" width="4" height="4" fill="#8B4513" />
            <rect x="44" y="148" width="4" height="12" fill="#8B4513" />
            <rect x="48" y="160" width="4" height="4" fill="#8B4513" />
            <rect x="152" y="148" width="4" height="12" fill="#8B4513" />
            <rect x="148" y="160" width="4" height="4" fill="#8B4513" />

            <rect x="64" y="100" width="28" height="24" fill="#B87048" />
            <rect x="64" y="100" width="28" height="4" fill="#C98B60" />
            {blinkOn ? (
              <>
                <rect x="64" y="104" width="28" height="8" fill="#B87048" />
                <rect x="66" y="104" width="24" height="4" fill="#B87048" />
              </>
            ) : (
              <>
                <rect x="66" y="104" width="24" height="16" fill="#1a0a00" />
                <rect x="68" y="106" width="20" height="12" fill="#4A2800" />
                <rect x="70" y="108" width="16" height="8" fill="#8B5E2C" />
                <rect x="72" y="110" width="8" height="4" fill="#F0D080" />
              </>
            )}
            <rect x="108" y="100" width="28" height="24" fill="#B87048" />
            <rect x="108" y="100" width="28" height="4" fill="#C98B60" />
            {blinkOn ? (
              <>
                <rect x="108" y="104" width="28" height="8" fill="#B87048" />
                <rect x="110" y="104" width="24" height="4" fill="#B87048" />
              </>
            ) : (
              <>
                <rect x="110" y="104" width="24" height="16" fill="#1a0a00" />
                <rect x="112" y="106" width="20" height="12" fill="#4A2800" />
                <rect x="114" y="108" width="16" height="8" fill="#8B5E2C" />
                <rect x="118" y="110" width="8" height="4" fill="#F0D080" />
              </>
            )}

            <rect x="60" y="96" width="36" height="4" fill="#3A1A00" />
            <rect x="104" y="96" width="36" height="4" fill="#3A1A00" />

            <rect x="58" y="94" width="40" height="8" fill="none" stroke="#B8860B" strokeWidth="2" />
            <rect x="58" y="94" width="4" height="8" fill="none" stroke="#B8860B" strokeWidth="2" />
            <rect x="94" y="94" width="4" height="8" fill="none" stroke="#B8860B" strokeWidth="2" />
            <rect x="60" y="94" width="36" height="2" fill="rgba(184,134,11,0.3)" />

            <rect x="102" y="94" width="40" height="8" fill="none" stroke="#B8860B" strokeWidth="2" />
            <rect x="102" y="94" width="4" height="8" fill="none" stroke="#B8860B" strokeWidth="2" />
            <rect x="138" y="94" width="4" height="8" fill="none" stroke="#B8860B" strokeWidth="2" />
            <rect x="104" y="94" width="36" height="2" fill="rgba(184,134,11,0.3)" />

            <rect x="98" y="96" width="4" height="4" fill="#B8860B" />

            <rect x="88" y="128" width="4" height="4" fill="#8B5E3C" />
            <rect x="100" y="124" width="4" height="8" fill="#9A6B44" />
            <rect x="108" y="128" width="4" height="4" fill="#8B5E3C" />

            <BartyMouth frame={mouthFrame} />

            <rect x="48" y="136" width="16" height="4" fill="#7A4A28" />
            <rect x="44" y="140" width="20" height="8" fill="#7A4A28" />
            <rect x="40" y="144" width="24" height="16" fill="#6B3E1E" />
            <rect x="44" y="148" width="20" height="12" fill="#7A4A28" />

            <rect x="136" y="136" width="16" height="4" fill="#7A4A28" />
            <rect x="136" y="140" width="20" height="8" fill="#7A4A28" />
            <rect x="136" y="144" width="24" height="16" fill="#6B3E1E" />
            <rect x="136" y="148" width="20" height="12" fill="#7A4A28" />

            <rect x="48" y="164" width="104" height="12" fill="#7A4A28" />
            <rect x="44" y="172" width="112" height="8" fill="#6B3E1E" />

            <rect x="36" y="180" width="128" height="4" fill="#2D1A09" />
            <rect x="40" y="184" width="120" height="70" fill="#1E3A5F" />
            <rect x="36" y="184" width="4" height="70" fill="#1A3254" />
            <rect x="160" y="184" width="4" height="70" fill="#1A3254" />

            <rect x="40" y="184" width="120" height="4" fill="#2E5080" />
            <rect x="40" y="188" width="120" height="2" fill="#1E3A5F" />

            <rect x="84" y="188" width="32" height="62" fill="#F5F0E8" />
            <rect x="84" y="188" width="32" height="4" fill="#E8E0D0" />
            <rect x="84" y="192" width="32" height="2" fill="#F5F0E8" />

            <rect x="76" y="184" width="4" height="12" fill="#2E5080" />
            <rect x="80" y="184" width="4" height="14" fill="#3A6296" />
            <rect x="120" y="184" width="4" height="12" fill="#2E5080" />
            <rect x="116" y="184" width="4" height="14" fill="#3A6296" />

            <rect x="40" y="188" width="40" height="2" fill="#1A3254" />
            <rect x="120" y="188" width="40" height="2" fill="#1A3254" />

            <rect x="56" y="196" width="24" height="2" fill="#F5A623" />
            <rect x="56" y="200" width="20" height="2" fill="#F5A623" />
            <rect x="120" y="196" width="24" height="2" fill="#F5A623" />
            <rect x="124" y="200" width="20" height="2" fill="#F5A623" />

            <rect x="0" y="0" width="200" height="250" fill="none" />
          </svg>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-primary/5 mix-blend-screen pointer-events-none" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
      </motion.div>

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
