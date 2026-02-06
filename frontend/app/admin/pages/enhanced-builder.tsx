"use client";

import { useState } from "react";

export type SectionType =
  | "hero"
  | "hero-video"
  | "about-hero"
  | "services-grid"
  | "features"
  | "values-grid"
  | "cta"
  | "cta-split"
  | "testimonials"
  | "team"
  | "pricing"
  | "stats"
  | "logo-carousel"
  | "faq"
  | "contact-form"
  | "careers-list"
  | "toggle-section"
  | "video"
  | "gallery"
  | "process"
  | "benefits"
  | "case-studies-grid"
  | "blog-grid"
  | "newsletter"
  | "text"
  | "image"
  | "columns"
  | "timeline";

interface Section {
  type: SectionType;
  data: any;
  id: string;
}

interface SectionConfig {
  name: string;
  icon: string;
  description: string;
  defaultData: any;
}

export const SECTION_TYPES: Record<SectionType, SectionConfig> = {
  hero: {
    name: "Hero Banner",
    icon: "🎯",
    description: "Large hero section with heading, subheading, and CTA",
    defaultData: {
      heading: "Welcome to Our Company",
      subheading: "We build amazing digital solutions",
      buttonText: "Get Started",
      buttonLink: "/contact",
      backgroundImage: "",
      alignment: "center",
    },
  },
  "hero-video": {
    name: "Hero with Video",
    icon: "🎬",
    description: "Hero section with background video",
    defaultData: {
      heading: "Transform Your Business",
      subheading: "Watch how we help companies succeed",
      videoUrl: "",
      buttonText: "Learn More",
      buttonLink: "/about",
    },
  },
  "services-grid": {
    name: "Services Grid",
    icon: "🛠️",
    description: "Grid layout for services",
    defaultData: {
      title: "Our Services",
      subtitle: "What we offer",
      columns: 3,
      services: [],
    },
  },
  features: {
    name: "Features List",
    icon: "✨",
    description: "Feature list with icons",
    defaultData: {
      title: "Key Features",
      subtitle: "Why choose us",
      features: [
        { icon: "🚀", title: "Fast Delivery", description: "Quick turnaround" },
        { icon: "💡", title: "Innovation", description: "Cutting-edge solutions" },
        { icon: "🔒", title: "Secure", description: "Enterprise-grade security" },
      ],
      columns: 3,
    },
  },
  cta: {
    name: "Call to Action",
    icon: "📢",
    description: "Simple CTA section",
    defaultData: {
      title: "Ready to Get Started?",
      description: "Contact us today to learn more",
      buttonText: "Contact Us",
      buttonLink: "/contact",
      backgroundColor: "#2563eb",
      textColor: "#ffffff",
    },
  },
  "cta-split": {
    name: "Split CTA",
    icon: "📣",
    description: "Two-column CTA section",
    defaultData: {
      leftTitle: "Start Free Trial",
      leftDescription: "No credit card required",
      leftButtonText: "Sign Up",
      leftButtonLink: "/signup",
      rightTitle: "Schedule Demo",
      rightDescription: "See it in action",
      rightButtonText: "Book Demo",
      rightButtonLink: "/demo",
    },
  },
  testimonials: {
    name: "Testimonials",
    icon: "💬",
    description: "Client testimonials carousel",
    defaultData: {
      title: "What Our Clients Say",
      testimonials: [
        {
          name: "John Doe",
          role: "CEO, Company",
          content: "Great service!",
          avatar: "",
          rating: 5,
        },
      ],
    },
  },
  team: {
    name: "Team Members",
    icon: "👥",
    description: "Team member profiles",
    defaultData: {
      title: "Our Team",
      subtitle: "Meet the experts",
      members: [
        {
          name: "John Doe",
          role: "CEO",
          bio: "Industry expert",
          image: "",
          social: { linkedin: "", twitter: "" },
        },
      ],
      columns: 4,
    },
  },
  pricing: {
    name: "Pricing Table",
    icon: "💰",
    description: "Pricing plans",
    defaultData: {
      title: "Pricing Plans",
      subtitle: "Choose the right plan",
      plans: [
        {
          name: "Basic",
          price: "$99",
          period: "/month",
          features: ["Feature 1", "Feature 2"],
          buttonText: "Get Started",
          buttonLink: "/signup",
          popular: false,
        },
      ],
      columns: 3,
    },
  },
  stats: {
    name: "Statistics",
    icon: "📊",
    description: "Numbers and statistics",
    defaultData: {
      title: "Our Impact",
      stats: [
        { number: "1000+", label: "Happy Clients", icon: "👥" },
        { number: "500+", label: "Projects", icon: "🚀" },
        { number: "50+", label: "Team Members", icon: "👨‍💼" },
        { number: "10+", label: "Years Experience", icon: "⭐" },
      ],
      columns: 4,
    },
  },
  "logo-carousel": {
    name: "Logo Carousel",
    icon: "🏢",
    description: "Client/partner logos",
    defaultData: {
      title: "Trusted By",
      logos: [
        { name: "Company 1", logo: "", link: "" },
        { name: "Company 2", logo: "", link: "" },
      ],
    },
  },
  faq: {
    name: "FAQ Accordion",
    icon: "❓",
    description: "Frequently asked questions",
    defaultData: {
      title: "Frequently Asked Questions",
      faqs: [
        { question: "Question 1?", answer: "Answer 1" },
        { question: "Question 2?", answer: "Answer 2" },
      ],
    },
  },
  "contact-form": {
    name: "Contact Form",
    icon: "📧",
    description: "Contact form section",
    defaultData: {
      title: "Get In Touch",
      subtitle: "We'd love to hear from you",
      fields: ["name", "email", "phone", "message"],
      buttonText: "Send Message",
      successMessage: "Thank you for your message!",
    },
  },
  video: {
    name: "Video Section",
    icon: "🎥",
    description: "Embedded video",
    defaultData: {
      title: "Watch Our Story",
      videoUrl: "",
      thumbnail: "",
      autoplay: false,
    },
  },
  gallery: {
    name: "Image Gallery",
    icon: "🖼️",
    description: "Image gallery grid",
    defaultData: {
      title: "Our Work",
      images: [
        { url: "", alt: "Image 1", caption: "" },
        { url: "", alt: "Image 2", caption: "" },
      ],
      columns: 3,
      lightbox: true,
    },
  },
  process: {
    name: "Process/Timeline",
    icon: "🔄",
    description: "Step-by-step process",
    defaultData: {
      title: "How We Work",
      steps: [
        { number: 1, title: "Discovery", description: "We understand your needs" },
        { number: 2, title: "Design", description: "We create the solution" },
        { number: 3, title: "Develop", description: "We build it" },
        { number: 4, title: "Deploy", description: "We launch it" },
      ],
    },
  },
  benefits: {
    name: "Benefits List",
    icon: "✅",
    description: "Benefits checklist",
    defaultData: {
      title: "Why Choose Us",
      benefits: [
        "24/7 Support",
        "Enterprise Security",
        "Scalable Solutions",
        "Expert Team",
      ],
      columns: 2,
    },
  },
  "case-studies-grid": {
    name: "Case Studies Grid",
    icon: "📚",
    description: "Showcase case studies",
    defaultData: {
      title: "Success Stories",
      subtitle: "See how we've helped clients",
      caseStudies: [],
      columns: 3,
    },
  },
  "blog-grid": {
    name: "Blog Posts Grid",
    icon: "📝",
    description: "Latest blog posts",
    defaultData: {
      title: "Latest Articles",
      subtitle: "Insights and updates",
      posts: [],
      columns: 3,
      limit: 6,
    },
  },
  newsletter: {
    name: "Newsletter Signup",
    icon: "📬",
    description: "Email subscription form",
    defaultData: {
      title: "Subscribe to Our Newsletter",
      description: "Get the latest updates",
      placeholder: "Enter your email",
      buttonText: "Subscribe",
    },
  },
  text: {
    name: "Text Content",
    icon: "📄",
    description: "Rich text content",
    defaultData: {
      content: "Your content here...",
      alignment: "left",
    },
  },
  image: {
    name: "Image",
    icon: "🖼️",
    description: "Single image",
    defaultData: {
      url: "",
      alt: "",
      caption: "",
      alignment: "center",
    },
  },
  columns: {
    name: "Multi-Column",
    icon: "📑",
    description: "Multi-column layout",
    defaultData: {
      columns: [
        { title: "Column 1", content: "Content 1" },
        { title: "Column 2", content: "Content 2" },
        { title: "Column 3", content: "Content 3" },
      ],
      columnCount: 3,
    },
  },
  timeline: {
    name: "Timeline",
    icon: "⏱️",
    description: "Vertical timeline",
    defaultData: {
      title: "Our Journey",
      events: [
        { date: "2020", title: "Company Founded", description: "We started" },
        { date: "2022", title: "100 Clients", description: "Milestone reached" },
      ],
    },
  },
  "about-hero": {
    name: "About Hero",
    icon: "🌟",
    description: "Special hero section for About pages with icon",
    defaultData: {
      heading: "We're Building the Future",
      subheading: "A passionate team dedicated to innovation",
      icon: "🌟",
    },
  },
  "values-grid": {
    name: "Values Grid",
    icon: "💎",
    description: "Display company values with icons",
    defaultData: {
      title: "Our Core Values",
      values: [
        { icon: "💡", title: "Innovation", description: "Cutting-edge solutions" },
        { icon: "🤝", title: "Partnership", description: "Building lasting relationships" },
        { icon: "⚡", title: "Excellence", description: "Quality in everything" },
        { icon: "🎯", title: "Results", description: "Measurable outcomes" },
      ],
    },
  },
  "careers-list": {
    name: "Careers List",
    icon: "💼",
    description: "Job listings with details",
    defaultData: {
      title: "Open Positions",
      subtitle: "Join our team",
      jobs: [
        {
          icon: "💻",
          title: "Senior Developer",
          type: "Full-time",
          description: "Build amazing products",
          location: "Remote",
          salary: "Competitive",
          experience: "5+ years",
          applyLink: "mailto:careers@socialit.in",
        },
      ],
    },
  },
  "toggle-section": {
    name: "Toggle Section",
    icon: "🔽",
    description: "Expandable/collapsible content section",
    defaultData: {
      title: "Click to Expand",
      icon: "🔽",
      defaultOpen: false,
      content: "<p>Hidden content that can be toggled</p>",
    },
  },
};

export function useSectionBuilder() {
  const [sections, setSections] = useState<Section[]>([]);

  const addSection = (type: SectionType) => {
    const config = SECTION_TYPES[type];
    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: JSON.parse(JSON.stringify(config.defaultData)),
    };
    setSections((prev) => [...prev, newSection]);
    return newSection;
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, data: any) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, data } : s))
    );
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;

      const newSections = [...prev];
      if (direction === "up" && index > 0) {
        [newSections[index - 1], newSections[index]] = [
          newSections[index],
          newSections[index - 1],
        ];
      } else if (direction === "down" && index < prev.length - 1) {
        [newSections[index], newSections[index + 1]] = [
          newSections[index + 1],
          newSections[index],
        ];
      }
      return newSections;
    });
  };

  return {
    sections,
    addSection,
    removeSection,
    updateSection,
    moveSection,
    setSections,
  };
}
