'use client';

import { useState, useEffect, useRef } from 'react';

const CHARS = '!<>-_\\/[]{}=+*^?#$@0123456789';

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  stepsPerChar?: number;
}

type CharState = { char: string; locked: boolean };

export function ScrambleText({
  text,
  className = '',
  delay = 0,
  speed = 22,
  stepsPerChar = 4,
}: ScrambleTextProps) {
  const [chars, setChars] = useState<CharState[]>(() =>
    text.split('').map(() => ({ char: '\u00A0', locked: false }))
  );
  const [complete, setComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setChars(text.split('').map(() => ({ char: '\u00A0', locked: false })));
    setComplete(false);

    let frame = 0;
    const totalFrames = text.length * stepsPerChar;

    const startTimer = setTimeout(() => {
      const tick = () => {
        const locked = Math.floor(frame / stepsPerChar);

        setChars(
          text.split('').map((original, i) => {
            if (original === ' ') return { char: ' ', locked: true };
            if (i < locked) return { char: original, locked: true };
            if (i === locked) {
              return {
                char: CHARS[Math.floor(Math.random() * CHARS.length)],
                locked: false,
              };
            }
            return { char: '\u00A0', locked: false };
          })
        );

        frame++;

        if (frame <= totalFrames) {
          timerRef.current = setTimeout(tick, speed);
        } else {
          setChars(text.split('').map(c => ({ char: c, locked: true })));
          setComplete(true);
        }
      };

      tick();
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, delay, speed, stepsPerChar]);

  return (
    <span className={`${className} ${complete ? 'scramble-complete' : ''}`}>
      {chars.map((c, i) => (
        <span
          key={i}
          className={!c.locked && c.char !== '\u00A0' ? 'text-primary-400 opacity-60' : ''}
        >
          {c.char}
        </span>
      ))}
    </span>
  );
}
