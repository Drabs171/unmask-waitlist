'use client';

import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
  pauseOnComplete?: number;
  startDelay?: number;
}

export const useTypewriter = ({
  words,
  typeSpeed = 50,
  deleteSpeed = 30,
  delayBetweenWords = 2000,
  loop = false,
  pauseOnComplete = 0,
  startDelay = 0,
}: UseTypewriterOptions) => {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isComplete && !loop) return;

    const handleType = () => {
      const currentWord = words[wordIndex];
      
      if (!currentWord) return;

      if (!isDeleting) {
        // Typing
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
          timeoutRef.current = setTimeout(handleType, typeSpeed + Math.random() * 50); // Add natural variation
        } else {
          // Word complete
          if (wordIndex === words.length - 1 && !loop) {
            setIsComplete(true);
            if (pauseOnComplete > 0) {
              timeoutRef.current = setTimeout(() => setShowCursor(false), pauseOnComplete);
            }
          } else {
            timeoutRef.current = setTimeout(() => setIsDeleting(true), delayBetweenWords);
          }
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
          timeoutRef.current = setTimeout(handleType, deleteSpeed);
        } else {
          // Deletion complete
          setIsDeleting(false);
          setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }
      }
    };

    // Start with delay
    timeoutRef.current = setTimeout(handleType, startDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    displayText,
    wordIndex,
    isDeleting,
    words,
    typeSpeed,
    deleteSpeed,
    delayBetweenWords,
    loop,
    isComplete,
    pauseOnComplete,
    startDelay,
  ]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, [showCursor, isComplete]);

  return {
    displayText,
    isComplete,
    showCursor: showCursor && !isComplete,
    currentWordIndex: wordIndex,
    isTyping: !isDeleting && !isComplete,
    isDeleting,
  };
};

// Single text typewriter for one-time animations
export const useSimpleTypewriter = (
  text: string,
  options: {
    typeSpeed?: number;
    startDelay?: number;
    onComplete?: () => void;
  } = {}
) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const rafRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const currentIndexRef = useRef<number>(0);
  const { typeSpeed = 50, startDelay = 0, onComplete } = options;

  useEffect(() => {
    if (isComplete) return;

    // Reset state when text changes
    currentIndexRef.current = 0;
    setDisplayText('');
    setIsComplete(false);
    setShowCursor(true);

    const handleType = (currentTime: number) => {
      if (currentIndexRef.current >= text.length) {
        setIsComplete(true);
        setShowCursor(false);
        onComplete?.();
        return;
      }

      if (currentTime - lastUpdateRef.current >= typeSpeed) {
        const nextText = text.substring(0, currentIndexRef.current + 1);
        setDisplayText(nextText);
        currentIndexRef.current++;
        lastUpdateRef.current = currentTime;
      }

      if (currentIndexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(handleType);
      }
    };

    const startTyping = () => {
      lastUpdateRef.current = performance.now();
      rafRef.current = requestAnimationFrame(handleType);
    };

    timeoutRef.current = setTimeout(startTyping, startDelay);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, typeSpeed, startDelay, isComplete, onComplete]);

  // Cursor blinking
  useEffect(() => {
    if (!showCursor || isComplete) return;

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [showCursor, isComplete]);

  return {
    displayText,
    isComplete,
    showCursor,
    isTyping: !isComplete,
  };
};