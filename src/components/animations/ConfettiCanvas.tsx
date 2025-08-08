'use client';

import React, { forwardRef } from 'react';
import { useConfetti } from '@/hooks/useConfetti';
import { cn } from '@/utils/cn';

interface ConfettiCanvasProps {
  className?: string;
}

const ConfettiCanvas = forwardRef<
  { fire: (originX?: number, originY?: number) => void; fireFromElement: (element: HTMLElement) => void; stop: () => void },
  ConfettiCanvasProps
>(({ className }, ref) => {
  const { canvasRef, fire, fireFromElement, stop } = useConfetti();

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    fire,
    fireFromElement,
    stop,
  }), [fire, fireFromElement, stop]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'fixed inset-0 pointer-events-none z-50',
        'w-full h-full',
        className
      )}
      style={{
        mixBlendMode: 'screen', // Blend mode for better visual effect
      }}
    />
  );
});

ConfettiCanvas.displayName = 'ConfettiCanvas';

export default ConfettiCanvas;