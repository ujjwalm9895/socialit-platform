/**
 * Animation utilities inspired by modern enterprise websites
 * Based on patterns from Zensar, Accenture, Deloitte, and similar IT services companies
 */

import { Variants, Transition } from "framer-motion";

// Slide animations (left, right, up, down)
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideInDown: Variants = {
  hidden: { opacity: 0, y: -100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8, ease: "easeInOut" }
  }
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Stagger container for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

// Stagger item for children
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Card hover animations
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.05, 
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

// Button animations
export const buttonTap: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

// Parallax effect
export const parallax: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

// Reveal animation (for text/content)
export const reveal: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
  visible: { 
    opacity: 1, 
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.8, ease: "easeInOut" }
  }
};

// Rotate animations
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0 },
  visible: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Bounce animation
export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Page transition variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" }
  }
};

// Smooth transition config
export const smoothTransition: Transition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1] // Custom cubic bezier
};

// Fast transition
export const fastTransition: Transition = {
  duration: 0.3,
  ease: "easeOut"
};

// Slow transition
export const slowTransition: Transition = {
  duration: 1,
  ease: "easeInOut"
};
