# Unmask.life - Waitlist Landing Page

A premium waitlist landing page for Unmask.life, a revolutionary dating app that prioritizes authentic conversations before revealing photos. Built for GenZ users who want meaningful connections over superficial swipes.

## 🚀 Features

- **Modern Design**: Glassmorphism UI with pink-to-blue gradients on dark backgrounds
- **Mobile-First**: Fully responsive design optimized for all devices
- **Smooth Animations**: Premium Framer Motion animations throughout
- **Email Validation**: Robust client-side validation with disposable email detection
- **Social Proof**: Real-time counter and testimonials to build trust
- **Analytics Ready**: Built-in analytics tracking for conversion optimization
- **Performance Optimized**: <2s load times with lazy loading and code splitting
- **Accessibility**: WCAG compliant with proper ARIA labels and semantic HTML

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Card)
│   ├── sections/        # Page sections (Hero, Features, SocialProof)
│   ├── forms/           # Form components (WaitlistForm)
│   └── animations/      # Animation components (FadeIn, GradientText, CounterAnimation)
├── hooks/               # Custom React hooks (useWaitlist)
├── utils/               # Helper functions (emailValidator, analytics, cn)
├── types/               # TypeScript interfaces
├── constants/           # App constants (BRAND_COLORS, etc.)
└── services/            # API and external services
```

## 🎨 Design System

### Colors
- **Primary Gradient**: `linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)`
- **Background**: `#0a0a0a`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a0a0a0`
- **Accent**: `#FF6B9D`
- **Success**: `#10B981`
- **Error**: `#EF4444`

### Typography Scale
- **Heading XL**: 4rem (64px) - Hero titles
- **Heading L**: 3rem (48px) - Section titles
- **Heading M**: 2rem (32px) - Card titles
- **Body L**: 1.25rem (20px) - Important text
- **Body M**: 1rem (16px) - Regular text
- **Body S**: 0.875rem (14px) - Secondary text

### Animation Timings
- **Fast**: 150ms - Micro-interactions
- **Medium**: 300ms - Standard transitions
- **Slow**: 500ms - Complex animations
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd unmask-waitlist
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📱 Components

### UI Components
- **Button**: Multiple variants (gradient, ghost, outline) with loading states
- **Input**: Enhanced input with focus effects and error handling
- **Card**: Glassmorphism cards with hover effects

### Animation Components
- **FadeIn**: Scroll-triggered fade animations with directional entry
- **GradientText**: Animated gradient text effects
- **CounterAnimation**: Smooth counting animations for metrics

### Section Components
- **Hero**: Main landing section with CTA and floating elements
- **Features**: Feature cards showcasing app benefits
- **SocialProof**: Statistics and testimonials with animated counters

## 🔒 Form Validation

The waitlist form includes comprehensive validation:
- Email format validation
- Disposable email detection
- Empty field validation
- Real-time error feedback
- Success state with position tracking

## 📊 Analytics Integration

Built-in analytics tracking for:
- Page views
- Button clicks
- Form interactions
- Waitlist conversions
- Error tracking

Replace the analytics implementation in `src/utils/analytics.ts` with your preferred provider (Google Analytics, Mixpanel, etc.).

## 🌐 SEO Optimization

- Comprehensive meta tags
- Open Graph and Twitter Card support
- Semantic HTML structure
- Performance optimizations
- Accessibility compliance

## 📈 Performance

- **Target Load Time**: <2 seconds
- **Mobile Optimization Score**: >95
- **Accessibility Score**: >90
- **Email Conversion Rate**: >15% (target)

## 🔧 Customization

### Brand Colors
Update colors in `src/constants/BRAND_COLORS.ts` and `tailwind.config.js`.

### Typography
Modify font settings in `src/app/layout.tsx` and typography scale in Tailwind config.

### Content
Update copy and messaging in component files:
- Hero: `src/components/sections/Hero.tsx`
- Features: `src/components/sections/Features.tsx`
- Social Proof: `src/components/sections/SocialProof.tsx`

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
Build the project and deploy the `out` folder:
```bash
npm run build
```

## 🤝 Contributing

1. Follow the established code style and patterns
2. Use TypeScript strict mode
3. Add proper JSDoc comments for complex functions
4. Ensure components are accessible
5. Test on mobile devices

## 📄 License

Private - All rights reserved by Unmask.life

---

Built with ❤️ for GenZ by the Unmask.life team
