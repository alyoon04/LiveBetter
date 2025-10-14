'use client';

import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export function TypingAnimation({ text, className = '', speed = 50, delay = 0 }: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Initial delay before starting
    const initialDelay = setTimeout(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, speed);

        return () => clearTimeout(timeout);
      } else {
        setIsComplete(true);
      }
    }, delay);

    return () => clearTimeout(initialDelay);
  }, [currentIndex, text, speed, delay]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse ml-1 inline-block w-0.5 h-[1em] bg-current align-middle" />
      )}
    </span>
  );
}
