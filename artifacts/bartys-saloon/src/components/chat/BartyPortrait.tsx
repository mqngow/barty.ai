import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type MouthFrame = 'idle' | 'talking-mid' | 'talking-open';

interface BartyPortraitProps {
  isSpeaking?: boolean;
}

const MOUTH_FRAMES: MouthFrame[] = ['idle', 'talking-mid', 'talking-open', 'talking-mid'];
const FRAME_INTERVAL_MS = 160;

function BartyMouth({ frame }: { frame: MouthFrame }) {
  if (frame === 'idle') {
    return (
      <g>
        <path d="M86 136 Q93 132 100 133 Q107 132 114 136" stroke="#7A3820" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M88 138 Q100 144 112 138" stroke="#7A3820" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M88 136 Q100 141 112 136 Q112 138 100 140 Q88 138 88 136 Z" fill="#9A4828" />
      </g>
    );
  }
  if (frame === 'talking-mid') {
    return (
      <g>
        <path d="M88 133 Q100 130 112 133" stroke="#7A3820" strokeWidth="1.5" fill="none" />
        <path d="M88 133 Q94 146 100 148 Q106 146 112 133 Q100 136 88 133 Z" fill="#1a0800" />
        <path d="M88 133 Q100 137 112 133" fill="#C04530" />
        <path d="M91 138 Q100 135 109 138" fill="#E07060" />
      </g>
    );
  }
  return (
    <g>
      <path d="M87 131 Q100 128 113 131" stroke="#7A3820" strokeWidth="1.5" fill="none" />
      <path d="M87 131 Q92 150 100 152 Q108 150 113 131 Q100 136 87 131 Z" fill="#1a0800" />
      <path d="M87 131 Q100 136 113 131" fill="#C04530" />
      <path d="M91 135 Q96 132 100 133 Q104 132 109 135" fill="#F0F0EE" />
      <ellipse cx="100" cy="145" rx="6" ry="4" fill="#C04530" />
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
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      frameIndexRef.current = 0;
      setMouthFrame('idle');
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [isSpeaking]);

  useEffect(() => {
    const blinkTimeoutRef = { current: 0 as unknown as ReturnType<typeof setTimeout> };
    const blinkLoop = () => {
      blinkTimeoutRef.current = setTimeout(() => {
        setBlinkOn(true);
        setTimeout(() => { setBlinkOn(false); blinkLoop(); }, 110);
      }, 2800 + Math.random() * 2400);
    };
    blinkLoop();
    return () => clearTimeout(blinkTimeoutRef.current);
  }, []);

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
          className="w-full h-full"
        >
          <svg
            viewBox="0 0 200 250"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              <radialGradient id="face-grad" cx="50%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#E8A878" />
                <stop offset="60%" stopColor="#D4956A" />
                <stop offset="100%" stopColor="#B87550" />
              </radialGradient>
              <radialGradient id="bg-glow" cx="50%" cy="55%" r="55%">
                <stop offset="0%" stopColor="#3A1E08" />
                <stop offset="100%" stopColor="#1A0C02" />
              </radialGradient>
              <radialGradient id="cheek-l" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D06858" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#D06858" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="cheek-r" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D06858" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#D06858" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ── Background ── */}
            <rect width="200" height="250" fill="url(#bg-glow)" />

            {/* ── Body / Vest ── */}
            <ellipse cx="100" cy="242" rx="76" ry="44" fill="#142A50" />
            <rect x="24" y="200" width="152" height="50" fill="#1A3258" />
            <rect x="24" y="200" width="152" height="4" fill="#243E6A" />
            {/* Apron center */}
            <rect x="78" y="196" width="44" height="54" fill="#F0ECD8" />
            <rect x="78" y="196" width="44" height="3" fill="#E0D8C0" />
            {/* Vest lapels */}
            <path d="M78 196 L56 240 L24 240 L24 200 Z" fill="#142A50" />
            <path d="M122 196 L144 240 L176 240 L176 200 Z" fill="#142A50" />
            <path d="M78 196 L60 220" stroke="#0E2040" strokeWidth="1.5" fill="none" />
            <path d="M122 196 L140 220" stroke="#0E2040" strokeWidth="1.5" fill="none" />
            {/* Apron buttons */}
            <circle cx="100" cy="208" r="2.5" fill="#C8A020" />
            <circle cx="100" cy="220" r="2.5" fill="#C8A020" />
            <circle cx="100" cy="232" r="2.5" fill="#C8A020" />
            {/* Pocket square hint */}
            <rect x="40" y="206" width="14" height="10" fill="#D4A020" rx="1" />
            <rect x="40" y="206" width="14" height="3" fill="#E0B830" rx="1" />

            {/* ── Neck ── */}
            <rect x="86" y="172" width="28" height="28" fill="#C98B60" rx="2" />
            <rect x="88" y="172" width="24" height="4" fill="#D4956A" />
            {/* Collar */}
            <path d="M78 196 Q86 184 100 180 Q114 184 122 196" fill="#F0ECD8" />
            <path d="M78 196 Q86 186 100 183 Q114 186 122 196" fill="#E0D8C0" stroke="none" />

            {/* ── Cowboy Hat ── */}
            {/* Brim */}
            <ellipse cx="100" cy="38" rx="76" ry="11" fill="#2A1608" />
            <ellipse cx="100" cy="36" rx="74" ry="9" fill="#381E0A" />
            <ellipse cx="100" cy="34" rx="72" ry="7" fill="#2A1608" />
            {/* Brim underside shadow */}
            <ellipse cx="100" cy="40" rx="74" ry="8" fill="#180A02" />
            {/* Crown */}
            <path d="M62 38 Q60 22 64 10 Q68 4 100 2 Q132 4 136 10 Q140 22 138 38 Z" fill="#2A1608" />
            <path d="M66 38 Q64 24 68 12 Q72 6 100 4 Q128 6 132 12 Q136 24 134 38 Z" fill="#341C0C" />
            {/* Crown highlight */}
            <path d="M72 36 Q72 16 80 8 Q90 4 100 4 Q100 4 96 8 Q88 14 86 36 Z" fill="#3E2210" />
            {/* Hat band */}
            <path d="M62 38 Q62 30 64 28 L136 28 Q138 30 138 38" fill="#B8860B" />
            <path d="M62 30 L138 30 L138 32 L62 32 Z" fill="#D4A020" />
            {/* Hat crease */}
            <path d="M72 20 Q100 16 128 20" stroke="#1A0A02" strokeWidth="3" fill="none" />
            {/* Decorative pin on band */}
            <circle cx="106" cy="30" r="3" fill="#D4A020" />
            <circle cx="106" cy="30" r="1.5" fill="#F0C040" />

            {/* ── Sideburns / hair under hat ── */}
            <rect x="52" y="38" width="10" height="28" fill="#1E0E04" rx="3" />
            <rect x="138" y="38" width="10" height="28" fill="#1E0E04" rx="3" />
            <path d="M52 56 Q50 62 52 68" stroke="#2A1408" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M148 56 Q150 62 148 68" stroke="#2A1408" strokeWidth="6" strokeLinecap="round" fill="none" />

            {/* ── Ears ── */}
            <ellipse cx="50" cy="98" rx="8" ry="12" fill="#C98B60" />
            <ellipse cx="51" cy="98" rx="5" ry="8" fill="#B07A50" />
            <ellipse cx="150" cy="98" rx="8" ry="12" fill="#C98B60" />
            <ellipse cx="149" cy="98" rx="5" ry="8" fill="#B07A50" />

            {/* ── Face (oval head) ── */}
            <ellipse cx="100" cy="110" rx="54" ry="72" fill="url(#face-grad)" />

            {/* Side shading */}
            <ellipse cx="56" cy="110" rx="18" ry="62" fill="#B87550" fillOpacity="0.5" />
            <ellipse cx="144" cy="110" rx="18" ry="62" fill="#B87550" fillOpacity="0.5" />

            {/* Cheek flush */}
            <ellipse cx="68" cy="112" rx="13" ry="10" fill="url(#cheek-l)" />
            <ellipse cx="132" cy="112" rx="13" ry="10" fill="url(#cheek-r)" />

            {/* Forehead */}
            <ellipse cx="100" cy="68" rx="36" ry="16" fill="#DCA070" fillOpacity="0.5" />

            {/* ── Eyebrows (thick, expressive) ── */}
            <path d="M62 82 Q72 76 88 78" stroke="#1E0E04" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M112 78 Q128 76 138 82" stroke="#1E0E04" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            {/* Brow inner edge lift */}
            <path d="M86 78 Q88 77 90 78" stroke="#1E0E04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M110 78 Q112 77 114 78" stroke="#1E0E04" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* ── Glasses frames ── */}
            {/* Left lens */}
            <rect x="60" y="85" width="40" height="24" rx="6" ry="6" fill="none" stroke="#C8A020" strokeWidth="2" />
            {/* Right lens */}
            <rect x="100" y="85" width="40" height="24" rx="6" ry="6" fill="none" stroke="#C8A020" strokeWidth="2" />
            {/* Bridge */}
            <path d="M100 97 L100 97" stroke="#C8A020" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="95" x2="100" y2="99" stroke="#C8A020" strokeWidth="1.5" />
            {/* Temples */}
            <line x1="60" y1="95" x2="50" y2="92" stroke="#C8A020" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="140" y1="95" x2="150" y2="92" stroke="#C8A020" strokeWidth="1.5" strokeLinecap="round" />
            {/* Lens tint */}
            <rect x="62" y="87" width="36" height="20" rx="4" fill="#B8860B" fillOpacity="0.08" />
            <rect x="102" y="87" width="36" height="20" rx="4" fill="#B8860B" fillOpacity="0.08" />

            {/* ── Eyes ── */}
            {/* Whites */}
            <ellipse cx="80" cy="97" rx="15" ry="10" fill="#F2EEE8" />
            <ellipse cx="120" cy="97" rx="15" ry="10" fill="#F2EEE8" />
            {/* Irises */}
            {blinkOn ? (
              <>
                <rect x="66" y="93" width="28" height="6" fill="#C98B60" rx="3" />
                <rect x="106" y="93" width="28" height="6" fill="#C98B60" rx="3" />
              </>
            ) : (
              <>
                <circle cx="80" cy="97" r="8" fill="#6B4020" />
                <circle cx="120" cy="97" r="8" fill="#6B4020" />
                <circle cx="80" cy="97" r="6" fill="#8B5A2A" />
                <circle cx="120" cy="97" r="6" fill="#8B5A2A" />
                {/* Pupils */}
                <circle cx="81" cy="97" r="3.5" fill="#0C0600" />
                <circle cx="121" cy="97" r="3.5" fill="#0C0600" />
                {/* Catchlight */}
                <circle cx="83" cy="94" r="2" fill="#FFFFFF" />
                <circle cx="123" cy="94" r="2" fill="#FFFFFF" />
                <circle cx="84" cy="95" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
                <circle cx="124" cy="95" r="0.8" fill="#FFFFFF" fillOpacity="0.6" />
              </>
            )}
            {/* Upper eyelid crease */}
            <path d="M65 89 Q80 84 95 89" stroke="#3A1808" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M105 89 Q120 84 135 89" stroke="#3A1808" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Lower eyelid */}
            <path d="M66 102 Q80 106 94 102" stroke="#B87850" strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.5" />
            <path d="M106 102 Q120 106 134 102" stroke="#B87850" strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.5" />

            {/* ── Nose ── */}
            {/* Bridge */}
            <path d="M97 105 Q94 113 91 118 Q100 124 109 118 Q106 113 103 105" fill="#C08555" fillOpacity="0.5" />
            {/* Tip */}
            <ellipse cx="100" cy="119" rx="9" ry="6" fill="#C98B60" />
            <ellipse cx="100" cy="117" rx="7" ry="4" fill="#D4A070" />
            {/* Nostrils */}
            <ellipse cx="92" cy="121" rx="3.5" ry="2.5" fill="#9A5A38" />
            <ellipse cx="108" cy="121" rx="3.5" ry="2.5" fill="#9A5A38" />
            {/* Nose shadow line */}
            <path d="M96 105 L94 118" stroke="#B07040" strokeWidth="1" strokeOpacity="0.4" fill="none" />
            <path d="M104 105 L106 118" stroke="#B07040" strokeWidth="1" strokeOpacity="0.4" fill="none" />

            {/* ── Handlebar Mustache ── */}
            <path
              d="M68 128
                 Q72 120 80 118 Q90 116 100 120
                 Q110 116 120 118 Q128 120 132 128
                 Q128 132 122 128 Q114 124 108 126 Q104 128 100 127
                 Q96 128 92 126 Q86 124 78 128
                 Q72 132 68 128 Z"
              fill="#1A0A02"
            />
            {/* Mustache highlight */}
            <path d="M80 120 Q100 116 120 120" stroke="#3A1E0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Mustache wax curl tips */}
            <path d="M68 128 Q62 126 60 120 Q60 116 64 116" stroke="#1A0A02" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M132 128 Q138 126 140 120 Q140 116 136 116" stroke="#1A0A02" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* ── Mouth (animated) ── */}
            <BartyMouth frame={mouthFrame} />

            {/* ── Beard ── */}
            <path
              d="M70 148 Q100 162 130 148
                 Q128 168 120 174 Q110 180 100 180
                 Q90 180 80 174 Q72 168 70 148 Z"
              fill="#1E0E04"
            />
            <path
              d="M74 150 Q100 164 126 150
                 Q124 168 116 174 Q108 178 100 178
                 Q92 178 84 174 Q76 168 74 150 Z"
              fill="#2A1408"
            />
            {/* Beard texture highlight */}
            <path d="M84 156 Q100 162 116 156" stroke="#3A1E0A" strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.6" />
            <path d="M80 162 Q100 168 120 162" stroke="#3A1E0A" strokeWidth="1" fill="none" strokeLinecap="round" strokeOpacity="0.4" />

            {/* ── Wrinkles / character lines ── */}
            {/* Smile lines */}
            <path d="M60 108 Q63 118 66 128" stroke="#A06840" strokeWidth="1.2" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
            <path d="M140 108 Q137 118 134 128" stroke="#A06840" strokeWidth="1.2" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
            {/* Forehead line */}
            <path d="M78 72 Q100 68 122 72" stroke="#B87550" strokeWidth="1" fill="none" strokeOpacity="0.35" strokeLinecap="round" />
            {/* Crow's feet */}
            <path d="M60 92 Q57 90 58 87" stroke="#A06840" strokeWidth="0.8" fill="none" strokeOpacity="0.4" />
            <path d="M140 92 Q143 90 142 87" stroke="#A06840" strokeWidth="0.8" fill="none" strokeOpacity="0.4" />

            {/* ── Ambient light overlay ── */}
            <ellipse cx="100" cy="100" rx="54" ry="72" fill="none" stroke="#F0C080" strokeWidth="0.5" strokeOpacity="0.15" />
          </svg>
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
