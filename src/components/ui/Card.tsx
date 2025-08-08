'use client';

import React from 'react';
import { CardPropsInterface } from '@/types';
import { cn } from '@/utils/cn';

const Card: React.FC<CardPropsInterface> = ({
  children,
  className,
  hover = true,
  padding = 'md',
}) => {
  const paddingVariants = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl glassmorphism',
        hover && 'glassmorphism-hover group cursor-pointer',
        paddingVariants[padding],
        'transform transition-all duration-medium',
        hover && 'hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;