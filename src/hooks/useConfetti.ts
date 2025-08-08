'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  colors?: string[];
  duration?: number;
  gravity?: number;
  wind?: number;
  shapes?: Array<'circle' | 'square' | 'triangle'>;
}

export const useConfetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const shouldReduceMotion = useReducedMotion();

  const defaultOptions: Required<ConfettiOptions> = {
    particleCount: 100,
    spread: 60,
    colors: ['#FF6B9D', '#4ECDC4', '#FF8A80', '#81C784', '#FFD54F'],
    duration: 3000,
    gravity: 0.3,
    wind: 0.1,
    shapes: ['circle', 'square', 'triangle'],
  };

  const createParticle = useCallback((
    originX: number,
    originY: number,
    options: Required<ConfettiOptions>
  ): Particle => {
    const angle = (Math.random() - 0.5) * (options.spread * Math.PI / 180);
    const velocity = Math.random() * 15 + 5;
    
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * options.wind,
      vy: Math.sin(angle) * velocity - Math.random() * 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: options.colors[Math.floor(Math.random() * options.colors.length)],
      size: Math.random() * 6 + 4,
      life: 0,
      maxLife: options.duration / 16, // ~60fps
      shape: options.shapes[Math.floor(Math.random() * options.shapes.length)],
    };
  }, []);

  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: Particle
  ) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    
    const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;

    const halfSize = particle.size / 2;

    switch (particle.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'square':
        ctx.fillRect(-halfSize, -halfSize, particle.size, particle.size);
        break;
      
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -halfSize);
        ctx.lineTo(-halfSize, halfSize);
        ctx.lineTo(halfSize, halfSize);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }, []);

  const updateParticles = useCallback((options: Required<ConfettiOptions>) => {
    particlesRef.current = particlesRef.current.filter(particle => {
      // Update physics
      particle.vy += options.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      particle.life++;

      // Apply wind resistance
      particle.vx *= 0.99;
      
      return particle.life < particle.maxLife && particle.y < window.innerHeight + 50;
    });
  }, []);

  const animate = useCallback((options: Required<ConfettiOptions>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    updateParticles(options);
    particlesRef.current.forEach(particle => drawParticle(ctx, particle));

    // Continue animation if particles exist
    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(() => animate(options));
    }
  }, [updateParticles, drawParticle]);

  const fire = useCallback((
    originX: number = window.innerWidth / 2,
    originY: number = window.innerHeight / 2,
    options: ConfettiOptions = {}
  ) => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Merge options with defaults
    const finalOptions = { ...defaultOptions, ...options };

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const newParticles = Array.from({ length: finalOptions.particleCount }, () =>
      createParticle(originX, originY, finalOptions)
    );

    particlesRef.current = [...particlesRef.current, ...newParticles];

    // Start animation if not already running
    if (!animationRef.current) {
      animate(finalOptions);
    }
  }, [shouldReduceMotion, createParticle, animate, defaultOptions]);

  const fireFromElement = useCallback((
    element: HTMLElement,
    options: ConfettiOptions = {}
  ) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    fire(centerX, centerY, options);
  }, [fire]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    particlesRef.current = [];
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    canvasRef,
    fire,
    fireFromElement,
    stop,
    isAnimating: !!animationRef.current,
  };
};