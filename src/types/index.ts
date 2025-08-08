export interface WaitlistUserInterface {
  email: string;
  name?: string;
  referralSource?: string;
  timestamp: Date;
}

export interface WaitlistFormDataInterface {
  email: string;
  name?: string;
}

export interface ApiResponseInterface<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FeatureCardInterface {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface SocialProofInterface {
  count: number;
  testimonials?: TestimonialInterface[];
}

export interface TestimonialInterface {
  id: string;
  name: string;
  text: string;
  avatar?: string;
}

export interface AnimationConfigInterface {
  duration: number;
  delay: number;
  easing: string;
}

export type ButtonVariant = 'gradient' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonPropsInterface {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputPropsInterface {
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export interface CardPropsInterface {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}