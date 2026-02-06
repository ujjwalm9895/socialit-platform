"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import ContactForm from "./ContactForm";
import { fetcher, LIST_SWR_CONFIG } from "../lib/swr";
import {
  slideInLeft,
  slideInRight,
  slideInUp,
  slideInDown,
  fadeIn,
  fadeInScale,
  staggerContainer,
  staggerItem,
  cardHover,
  reveal,
  rotateIn,
  bounceIn,
  smoothTransition,
} from "./AnimationUtils";

interface Section {
  type: string;
  data: any;
  id?: string;
}

interface SectionRendererProps {
  section: Section;
  index: number;
}

export default function SectionRenderer({ section, index }: SectionRendererProps) {
  // Fetch services when missing, empty, or legacy format (array of strings instead of objects)
  const servicesIsLegacyOrEmpty =
    !section.data?.services ||
    section.data.services.length === 0 ||
    (section.data.services.length > 0 && typeof section.data.services[0] !== "object");
  const needServices = section.type === "services-grid" && servicesIsLegacyOrEmpty;
  const needBlogs = section.type === "blog-grid" && (!section.data?.posts || section.data.posts.length === 0);
  const needCaseStudies = section.type === "case-studies-grid" && (!section.data?.caseStudies || section.data.caseStudies.length === 0);

  const { data: servicesList, isLoading: servicesLoading } = useSWR<any[]>(needServices ? "/cms/services" : null, fetcher, LIST_SWR_CONFIG);
  const { data: blogsList, isLoading: blogsLoading } = useSWR<any[]>(needBlogs ? "/cms/blogs" : null, fetcher, LIST_SWR_CONFIG);
  const { data: caseStudiesList, isLoading: caseStudiesLoading } = useSWR<any[]>(needCaseStudies ? "/cms/case-studies" : null, fetcher, LIST_SWR_CONFIG);

  const loading = (needServices && servicesLoading) || (needBlogs && blogsLoading) || (needCaseStudies && caseStudiesLoading);

  const dynamicData = useMemo(() => {
    const d: Record<string, any> = {};
    if (needServices && servicesList !== undefined) {
      let list = Array.isArray(servicesList) ? servicesList.filter((s: any) => s.status === "published") : [];
      const selectedSlugs = section.data?.selectedServiceSlugs;
      if (Array.isArray(selectedSlugs) && selectedSlugs.length > 0) {
        const set = new Set(selectedSlugs);
        list = list.filter((s: any) => set.has(s.slug));
        list.sort((a: any, b: any) => selectedSlugs.indexOf(a.slug) - selectedSlugs.indexOf(b.slug));
      }
      d.services = list;
    }
    if (needBlogs && blogsList !== undefined) {
      d.posts = Array.isArray(blogsList) ? blogsList.filter((b: any) => b.status === "published") : [];
    }
    if (needCaseStudies && caseStudiesList !== undefined) {
      d.caseStudies = Array.isArray(caseStudiesList) ? caseStudiesList.filter((cs: any) => cs.status === "published") : [];
    }
    return Object.keys(d).length ? d : null;
  }, [needServices, needBlogs, needCaseStudies, servicesList, blogsList, caseStudiesList]);

  const sectionData = useMemo(() => {
    if (dynamicData) return { ...section.data, ...dynamicData };
    return section.data;
  }, [section.data, dynamicData]);

  // Helper function to get section styles
  const getSectionStyles = () => {
    const styles: React.CSSProperties = {};
    
    // Handle gradient background
    if (sectionData?.useGradient && sectionData?.gradientFrom && sectionData?.gradientTo) {
      const direction = sectionData.gradientDirection || "to right";
      styles.background = `linear-gradient(${direction}, ${sectionData.gradientFrom}, ${sectionData.gradientTo})`;
    } else if (sectionData?.backgroundColor) {
      styles.backgroundColor = sectionData.backgroundColor;
    }
    
    if (sectionData?.textColor) {
      styles.color = sectionData.textColor;
    }
    if (sectionData?.fontFamily && sectionData.fontFamily !== "inherit") {
      styles.fontFamily = sectionData.fontFamily;
    }
    if (sectionData?.textAlign) {
      styles.textAlign = sectionData.textAlign as any;
    }
    if (sectionData?.paddingTop !== undefined) {
      styles.paddingTop = `${sectionData.paddingTop}px`;
    }
    if (sectionData?.paddingBottom !== undefined) {
      styles.paddingBottom = `${sectionData.paddingBottom}px`;
    }
    if (sectionData?.backgroundImage) {
      styles.backgroundImage = `url(${sectionData.backgroundImage})`;
      styles.backgroundSize = "cover";
      styles.backgroundPosition = "center";
    }
    if (sectionData?.borderRadius !== undefined) {
      styles.borderRadius = `${sectionData.borderRadius}px`;
    }
    if (sectionData?.boxShadow) {
      switch (sectionData.boxShadow) {
        case "sm":
          styles.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
          break;
        case "md":
          styles.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
          break;
        case "lg":
          styles.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
          break;
        case "xl":
          styles.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
          break;
      }
    }
    
    return styles;
  };

  const renderSectionContent = () => {
    const sectionStyles = getSectionStyles();
    
    switch (section.type) {
      case "hero":
        const heroRef = useRef(null);
        const { scrollYProgress } = useScroll({
          target: heroRef,
          offset: ["start start", "end start"]
        });
        const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
        const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
        
        return (
          <motion.section
            ref={heroRef}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 ${
              sectionData?.backgroundImage
                ? "bg-cover bg-center"
                : !sectionData?.backgroundColor && !sectionData?.useGradient
                ? "hero-default-gradient"
                : ""
            } ${!sectionData?.textColor ? "text-white" : ""}`}
            style={sectionStyles}
          >
            {/* Parallax background */}
            <motion.div 
              style={{ y, opacity }}
              className="absolute inset-0"
            >
              {!sectionData?.backgroundImage && !sectionData?.backgroundColor && !sectionData?.useGradient && (
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)`,
                  }}
                />
              )}
            </motion.div>
            
            <div className="relative z-10 max-w-7xl mx-auto w-full">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className={`max-w-4xl ${
                  sectionData?.alignment === "left"
                    ? "text-left ml-0"
                    : sectionData?.alignment === "right"
                    ? "text-right ml-auto"
                    : "text-center mx-auto"
                }`}
              >
                {sectionData?.heading && (
                  <motion.h1
                    variants={reveal}
                    className="text-6xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent"
                    style={{
                      background: `linear-gradient(120deg, #fff 0%, color-mix(in srgb, var(--color-primary) 25%, white) 50%, color-mix(in srgb, var(--color-secondary) 25%, white) 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {sectionData.heading}
                  </motion.h1>
                )}
                {sectionData?.subheading && (
                  <motion.p
                    variants={slideInUp}
                    className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed"
                  >
                    {sectionData.subheading}
                  </motion.p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-wrap gap-4 justify-center md:justify-start"
                >
                  {sectionData?.cta_text && sectionData?.cta_link && (
                    <a
                      href={sectionData.cta_link}
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
                      style={{
                        background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                      }}
                    >
                      <span className="relative z-10">{sectionData.cta_text}</span>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(to right, var(--color-secondary), var(--color-primary))`,
                        }}
                      ></div>
                    </a>
                  )}
                  {sectionData?.secondary_cta_text && sectionData?.secondary_cta_link && (
                    <a
                      href={sectionData.secondary_cta_link}
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/50 rounded-lg hover:bg-white/10 hover:border-white transition-all duration-300"
                    >
                      {sectionData.secondary_cta_text}
                    </a>
                  )}
                </motion.div>
              </motion.div>
            </div>
            
            {/* Floating particles effect */}
            {!sectionData?.backgroundImage && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/20 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            )}
          </motion.section>
        );

      case "hero-video":
        return (
          <section 
            className={`relative px-4 overflow-hidden ${
              !sectionData?.textColor ? "text-white" : ""
            } ${!sectionData?.backgroundColor ? "bg-gray-900" : ""}`}
            style={sectionStyles}
          >
            {sectionData?.videoUrl && (
              <video
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              >
                <source src={sectionData.videoUrl} type="video/mp4" />
              </video>
            )}
            <div className="relative max-w-4xl mx-auto text-center z-10">
              {sectionData?.heading && (
                <h1 className="text-5xl font-bold mb-4">{sectionData.heading}</h1>
              )}
              {sectionData?.subheading && (
                <p className="text-xl mb-8">{sectionData.subheading}</p>
              )}
              {sectionData?.buttonText && (
                <a
                  href={sectionData.buttonLink}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {sectionData.buttonText}
                </a>
              )}
            </div>
          </section>
        );

      case "services-grid":
        const titleColor = sectionData?.titleColor || "var(--color-text)";
        const subtitleColor = sectionData?.subtitleColor || "var(--color-text-secondary)";
        const cardBgColor = sectionData?.cardBackgroundColor || "var(--color-surface)";
        const cardBorderColor = sectionData?.cardBorderColor || "var(--color-border)";
        const hoverOverlayColor = sectionData?.hoverOverlayColor || "var(--color-primary)";
        const linkColor = sectionData?.linkColor || "var(--color-primary)";
        const shadowColor = sectionData?.cardShadowColor || "#000000";
        const shadowOpacity = sectionData?.shadowOpacity || 0.1;
        
        // Card gradient support
        const cardUseGradient = sectionData?.cardUseGradient || false;
        const cardGradientFrom = sectionData?.cardGradientFrom || "#F8F9FA";
        const cardGradientTo = sectionData?.cardGradientTo || "#FFFFFF";
        
        // Get card background style
        const getCardBackgroundStyle = () => {
          if (cardUseGradient && cardGradientFrom && cardGradientTo) {
            return {
              background: `linear-gradient(to bottom right, ${cardGradientFrom}, ${cardGradientTo})`,
            };
          }
          return {
            backgroundColor: cardBgColor,
          };
        };
        
        // Get animation variants
        const animationType = sectionData?.animationType || "fadeIn";
        let animationVariants = fadeIn;
        if (animationType !== "auto" && animationType !== "none") {
          switch (animationType) {
            case "slideInUp":
              animationVariants = slideInUp;
              break;
            case "slideInDown":
              animationVariants = slideInDown;
              break;
            case "slideInLeft":
              animationVariants = slideInLeft;
              break;
            case "slideInRight":
              animationVariants = slideInRight;
              break;
            case "fadeIn":
              animationVariants = fadeIn;
              break;
            case "fadeInScale":
              animationVariants = fadeInScale;
              break;
            case "reveal":
              animationVariants = reveal;
              break;
            default:
              animationVariants = fadeIn;
          }
        }
        
        return (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: sectionData?.animateOnce !== false, margin: "-100px" }}
            variants={animationVariants}
            transition={{ 
              duration: sectionData?.animationDuration || 0.6, 
              delay: sectionData?.animationDelay || 0,
              ease: sectionData?.animationEasing || "easeOut"
            }}
            className="px-4 py-20"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <motion.h2
                  variants={slideInUp}
                  className="text-4xl md:text-5xl font-bold mb-4 text-center"
                  style={{ color: titleColor }}
                >
                  {sectionData.title}
                </motion.h2>
              )}
              {sectionData?.subtitle && (
                <motion.p
                  variants={slideInUp}
                  className="text-xl text-center mb-12 max-w-3xl mx-auto"
                  style={{ color: subtitleColor }}
                >
                  {sectionData.subtitle}
                </motion.p>
              )}
              {loading ? (
                <div className="text-center py-12">
                  <div 
                    className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
                    style={{ borderColor: linkColor }}
                  ></div>
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 3} gap-8`}
                >
                  {sectionData?.services?.map((service: any, idx: number) => {
                    const isLegacyString = typeof service === "string";
                    const title = isLegacyString ? service : (service?.title ?? "");
                    const slug = isLegacyString ? null : service?.slug;
                    const description = isLegacyString ? "" : (service?.description || service?.subtitle || "");
                    const iconUrl = isLegacyString ? null : service?.icon_url;
                    return (
                    <motion.a
                      key={slug || idx}
                      variants={staggerItem}
                      whileHover="hover"
                      initial="rest"
                      href={slug ? `/services/${slug}` : "#"}
                      className="group relative p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border"
                      style={{
                        ...getCardBackgroundStyle(),
                        borderColor: cardBorderColor,
                        borderWidth: "1px",
                        borderStyle: "solid",
                        boxShadow: `0 4px 6px -1px rgba(${parseInt(shadowColor.slice(1, 3), 16)}, ${parseInt(shadowColor.slice(3, 5), 16)}, ${parseInt(shadowColor.slice(5, 7), 16)}, ${shadowOpacity})`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 20px 25px -5px ${shadowColor}${Math.round((shadowOpacity * 1.5) * 255).toString(16).padStart(2, '0')}`;
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 4px 6px -1px ${shadowColor}${Math.round(shadowOpacity * 255).toString(16).padStart(2, '0')}`;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Gradient overlay on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(to bottom right, ${hoverOverlayColor}15, ${hoverOverlayColor}08)`,
                        }}
                      ></div>
                      
                      <div className="relative z-10">
                        {iconUrl && (
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="text-5xl mb-4"
                          >
                            <img src={iconUrl} alt={title} className="w-16 h-16" />
                          </motion.div>
                        )}
                        <h3 
                          className="text-xl font-bold mb-3 transition-colors"
                          style={{ color: titleColor }}
                          onMouseEnter={(e) => e.currentTarget.style.color = linkColor}
                          onMouseLeave={(e) => e.currentTarget.style.color = titleColor}
                        >
                          {title}
                        </h3>
                        {description && (
                        <p 
                          className="text-sm mb-4 line-clamp-3"
                          style={{ color: subtitleColor }}
                        >
                          {description}
                        </p>
                        )}
                        {slug && (
                          <motion.span
                            whileHover={{ x: 5 }}
                            className="text-sm font-semibold mt-4 inline-flex items-center gap-2 group-hover:gap-3 transition-all"
                            style={{ color: linkColor }}
                          >
                            Learn more
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </motion.span>
                        )}
                      </div>
                    </motion.a>
                  );})}
                </motion.div>
              )}
            </div>
          </motion.section>
        );

      case "features":
        return (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="px-4 py-20"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <motion.h2
                  variants={slideInUp}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center"
                >
                  {sectionData.title}
                </motion.h2>
              )}
              {sectionData?.subtitle && (
                <motion.p
                  variants={slideInUp}
                  className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto"
                >
                  {sectionData.subtitle}
                </motion.p>
              )}
              <motion.div
                variants={staggerContainer}
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 3} gap-8`}
              >
                {sectionData?.features?.map((feature: any, idx: number) => (
                  <motion.div
                    key={idx}
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="text-5xl mb-4 inline-block"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        );

      case "cta":
        // Use gradient if specified, otherwise use default gradient or solid color
        const ctaBackground = sectionData?.useGradient && sectionData?.gradientFrom && sectionData?.gradientTo
          ? `linear-gradient(${sectionData.gradientDirection || "to right"}, ${sectionData.gradientFrom}, ${sectionData.gradientTo})`
          : sectionStyles.backgroundColor || `linear-gradient(to right, var(--color-primary), var(--color-secondary))`;
        
        return (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="px-4 py-20 text-white"
            style={{
              ...sectionStyles,
              background: ctaBackground,
            }}
          >
            <div className="max-w-4xl mx-auto text-center">
              {sectionData?.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  {sectionData.title}
                </motion.h2>
              )}
              {sectionData?.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl mb-10 opacity-90"
                >
                  {sectionData.subtitle || sectionData.description}
                </motion.p>
              )}
              {sectionData?.cta_text && sectionData?.cta_link && (
                <motion.a
                  href={sectionData.cta_link}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-white px-8 py-4 rounded-lg font-semibold hover:shadow-2xl transition-all text-lg"
                  style={{ color: "var(--color-primary)" }}
                >
                  {sectionData.cta_text}{sectionData?.icon ? ` ${sectionData.icon}` : ""}
                </motion.a>
              )}
            </div>
          </motion.section>
        );

      case "cta-split":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-600 text-white p-8 rounded-lg">
                {sectionData?.leftTitle && (
                  <h3 className="text-2xl font-bold mb-2">{sectionData.leftTitle}</h3>
                )}
                {sectionData?.leftDescription && (
                  <p className="mb-4 opacity-90">{sectionData.leftDescription}</p>
                )}
                {sectionData?.leftButtonText && (
                  <a
                    href={sectionData.leftButtonLink}
                    className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    {sectionData.leftButtonText}
                  </a>
                )}
              </div>
              <div 
                className="text-white p-8 rounded-lg"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {sectionData?.rightTitle && (
                  <h3 className="text-2xl font-bold mb-2">{sectionData.rightTitle}</h3>
                )}
                {sectionData?.rightDescription && (
                  <p className="mb-4 opacity-90">{sectionData.rightDescription}</p>
                )}
                {sectionData?.rightButtonText && (
                  <a
                    href={sectionData.rightButtonLink}
                    className="inline-block bg-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {sectionData.rightButtonText}
                  </a>
                )}
              </div>
            </div>
          </section>
        );

      case "testimonials":
        return (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="px-4 py-20"
            style={{ ...sectionStyles, backgroundColor: sectionStyles.backgroundColor || "var(--color-surface)" }}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-4 text-center"
                  style={{ color: sectionData?.titleColor || "var(--color-text)" }}
                >
                  {sectionData.title}
                </motion.h2>
              )}
              {sectionData?.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl text-center mb-16 max-w-3xl mx-auto"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {sectionData.subtitle}
                </motion.p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {sectionData?.testimonials?.map((testimonial: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border"
                    style={{
                      background: "linear-gradient(to bottom right, var(--color-surface), var(--color-background))",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <span key={i} className="text-lg" style={{ color: "var(--color-accent)" }}>⭐</span>
                      ))}
                    </div>
                    <blockquote className="mb-6 text-lg leading-relaxed" style={{ color: "var(--color-text)" }}>
                      "{testimonial.text || testimonial.content}"
                    </blockquote>
                    <div className="flex items-center pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                      {testimonial.avatar && (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                      )}
                      <div>
                        <div className="font-bold" style={{ color: "var(--color-text)" }}>{testimonial.name}</div>
                        <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{testimonial.role}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        );

      case "team":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  {sectionData.title}
                </h2>
              )}
              {sectionData?.subtitle && (
                <p className="text-gray-600 text-center mb-12">{sectionData.subtitle}</p>
              )}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 4} gap-8`}
              >
                {sectionData?.members?.map((member: any, idx: number) => (
                  <div key={idx} className="text-center">
                    {member.image && (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-gray-600 mb-2">{member.role}</p>
                    <p className="text-sm text-gray-500 mb-4">{member.bio}</p>
                    <div className="flex justify-center gap-2">
                      {member.social?.linkedin && (
                        <a href={member.social.linkedin} className="text-blue-600">
                          LinkedIn
                        </a>
                      )}
                      {member.social?.twitter && (
                        <a href={member.social.twitter} className="text-blue-400">
                          Twitter
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "pricing":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  {sectionData.title}
                </h2>
              )}
              {sectionData?.subtitle && (
                <p className="text-gray-600 text-center mb-12">{sectionData.subtitle}</p>
              )}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 3} gap-8`}
              >
                {sectionData?.plans?.map((plan: any, idx: number) => (
                  <div
                    key={idx}
                    className={`bg-white p-8 rounded-lg shadow-md ${
                      plan.popular ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                        Popular
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                    <ul className="mb-6 space-y-2">
                      {plan.features?.map((feature: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.buttonText && (
                      <a
                        href={plan.buttonLink}
                        className="block w-full text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        {plan.buttonText}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "stats":
        return (
          <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`px-4 py-20 ${
              !sectionData?.backgroundColor && !sectionData?.useGradient
                ? "stats-default-gradient"
                : ""
            } ${!sectionData?.textColor ? "text-white" : ""}`}
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-16 text-center"
                >
                  {sectionData.title}
                </motion.h2>
              )}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 4} gap-8`}
              >
                {sectionData?.stats?.map((stat: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    {stat.icon && (
                      <div className="text-4xl mb-4">{stat.icon}</div>
                    )}
                    {(stat.value || stat.number) && (
                      <div 
                      className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent"
                      style={{
                        backgroundImage: "linear-gradient(135deg, #fff 0%, color-mix(in srgb, var(--color-secondary) 40%, white) 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                      }}
                    >
                        {stat.value || stat.number}
                      </div>
                    )}
                    {stat.label && (
                      <div className="text-lg opacity-90">{stat.label}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        );

      case "logo-carousel":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                  {sectionData.title}
                </h2>
              )}
              <div className="flex flex-wrap justify-center items-center gap-8">
                {sectionData?.logos?.map((logo: any, idx: number) => (
                  <a
                    key={idx}
                    href={logo.link || "#"}
                    className="opacity-60 hover:opacity-100 transition"
                  >
                    {logo.logo ? (
                      <img src={logo.logo} alt={logo.name} className="h-12" />
                    ) : (
                      <span className="text-gray-400">{logo.name}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </section>
        );

      case "faq":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-3xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                  {sectionData.title}
                </h2>
              )}
              <div className="space-y-4">
                {sectionData?.faqs?.map((faq: any, idx: number) => (
                  <div key={idx} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "video":
        return (
          <section 
            className={`px-4 ${!sectionData?.textColor ? "text-white" : ""} ${
              !sectionData?.backgroundColor ? "bg-gray-900" : ""
            }`}
            style={sectionStyles}
          >
            <div className="max-w-4xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                  {sectionData.title}
                </h2>
              )}
              {sectionData?.videoUrl && (
                <div className="relative aspect-video">
                  <iframe
                    src={sectionData.videoUrl}
                    className="absolute inset-0 w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </section>
        );

      case "gallery":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                  {sectionData.title}
                </h2>
              )}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 3} gap-4`}
              >
                {sectionData?.images?.map((image: any, idx: number) => (
                  <div key={idx} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt || `Image ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "process":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                  {sectionData.title}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {sectionData?.steps?.map((step: any, idx: number) => (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "benefits":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                  {sectionData.title}
                </h2>
              )}
              <div
                className={`grid grid-cols-1 md:grid-cols-${sectionData?.columns || 2} gap-6`}
              >
                {sectionData?.benefits?.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-start">
                    <span className="text-green-500 text-xl mr-3">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "case-studies-grid":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  {sectionData.title}
                </h2>
              )}
              {sectionData?.subtitle && (
                <p className="text-gray-600 text-center mb-12">{sectionData.subtitle}</p>
              )}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 3} gap-8`}
                >
                  {sectionData?.caseStudies?.map((cs: any, idx: number) => (
                    <a
                      key={idx}
                      href={cs.slug ? `/case-studies/${cs.slug}` : "#"}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                    >
                      {cs.featured_image_url && (
                        <img
                          src={cs.featured_image_url}
                          alt={cs.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{cs.title}</h3>
                        {cs.client_name && (
                          <p className="text-sm text-gray-500 mb-2">Client: {cs.client_name}</p>
                        )}
                        <p className="text-gray-600 text-sm">{cs.excerpt}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case "blog-grid":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  {sectionData.title}
                </h2>
              )}
              {sectionData?.subtitle && (
                <p className="text-gray-600 text-center mb-12">{sectionData.subtitle}</p>
              )}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${sectionData?.columns || 3} gap-8`}
                >
                  {sectionData?.posts?.slice(0, sectionData?.limit || 6).map((post: any, idx: number) => (
                    <a
                      key={idx}
                      href={post.slug ? `/blogs/${post.slug}` : "#"}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-gray-200"
                    >
                      {post.featured_image_url && (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                        {post.published_at && (
                          <p className="text-gray-500 text-xs">
                            {new Date(post.published_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case "newsletter":
        return (
          <section 
            className={`px-4 ${
              !sectionData?.backgroundColor ? "bg-blue-600" : ""
            } ${!sectionData?.textColor ? "text-white" : ""}`}
            style={sectionStyles}
          >
            <div className="max-w-2xl mx-auto text-center">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold mb-4">{sectionData.title}</h2>
              )}
              {sectionData?.description && (
                <p className="text-lg mb-8 opacity-90">{sectionData.description}</p>
              )}
              <form className="flex gap-4">
                <input
                  type="email"
                  placeholder={sectionData?.placeholder || "Enter your email"}
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                />
                <button
                  type="submit"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  {sectionData?.buttonText || "Subscribe"}
                </button>
              </form>
            </div>
          </section>
        );

      case "text":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div
              className={`max-w-3xl mx-auto ${
                sectionData?.alignment === "center"
                  ? "text-center"
                  : sectionData?.alignment === "right"
                  ? "text-right"
                  : "text-left"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{ __html: sectionData?.content || "" }}
                className="prose prose-lg"
              />
            </div>
          </section>
        );

      case "image":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div
              className={`max-w-4xl mx-auto ${
                sectionData?.alignment === "center"
                  ? "text-center"
                  : sectionData?.alignment === "right"
                  ? "text-right"
                  : "text-left"
              }`}
            >
              {sectionData?.url && (
                <img
                  src={sectionData.url}
                  alt={sectionData.alt || ""}
                  className="rounded-lg"
                />
              )}
              {sectionData?.caption && (
                <p className="text-sm text-gray-500 mt-2">{sectionData.caption}</p>
              )}
            </div>
          </section>
        );

      case "columns":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              <div
                className={`grid grid-cols-1 md:grid-cols-${sectionData?.columnCount || 3} gap-8`}
              >
                {sectionData?.columns?.map((column: any, idx: number) => (
                  <div key={idx}>
                    {column.title && (
                      <h3 className="text-xl font-semibold mb-3">{column.title}</h3>
                    )}
                    <div
                      dangerouslySetInnerHTML={{ __html: column.content || "" }}
                      className="prose"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "timeline":
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-4xl mx-auto">
              {sectionData?.title && (
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                  {sectionData.title}
                </h2>
              )}
              <div className="space-y-8">
                {sectionData?.events?.map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {event.date}
                      </div>
                    </div>
                    <div className="flex-1 pb-8 border-l-2 border-gray-300 pl-6">
                      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "contact-form":
        return (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="px-4 py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50"
            style={sectionStyles}
          >
            <div className="max-w-4xl mx-auto">
              {sectionData?.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center"
                >
                  {sectionData.title}
                </motion.h2>
              )}
              {sectionData?.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto"
                >
                  {sectionData.subtitle}
                </motion.p>
              )}
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <ContactForm />
              </div>
            </div>
          </motion.section>
        );

      case "about-hero":
        const patternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
        const aboutHeroStyle = sectionStyles?.background
          ? sectionStyles
          : {
              ...sectionStyles,
              background: `linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary) 80%, black), color-mix(in srgb, var(--color-primary) 60%, black), color-mix(in srgb, var(--color-secondary) 80%, black))`,
            };
        return (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4"
            style={aboutHeroStyle}
          >
            <div 
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: `url("${patternUrl}")` }}
            ></div>
            <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
              {sectionData?.icon ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-8xl mb-6"
                >
                  {sectionData.icon}
                </motion.div>
              ) : null}
              {sectionData?.heading && (
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-5xl md:text-7xl font-bold mb-6"
                >
                  {sectionData.heading}
                </motion.h1>
              )}
              {sectionData?.subheading && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto"
                >
                  {sectionData.subheading}
                </motion.p>
              )}
            </div>
          </motion.section>
        );

      case "values-grid":
        return (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="px-4 py-20 bg-white"
            style={sectionStyles}
          >
            <div className="max-w-7xl mx-auto">
              {sectionData?.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center"
                >
                  {sectionData.title}
                </motion.h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                {sectionData?.values?.map((value: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300"
                    style={{
                      background: `linear-gradient(to bottom right, 
                        color-mix(in srgb, var(--color-primary) 5%, white),
                        color-mix(in srgb, var(--color-secondary) 5%, white)
                      )`,
                    }}
                  >
                    {value.icon ? <div className="text-5xl mb-4">{value.icon}</div> : null}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        );

      case "careers-list":
        return (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="px-4 py-20 bg-gradient-to-b from-white to-gray-50"
            style={sectionStyles}
          >
            <div className="max-w-6xl mx-auto">
              {sectionData?.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center"
                >
                  {sectionData.title}
                </motion.h2>
              )}
              {sectionData?.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto"
                >
                  {sectionData.subtitle}
                </motion.p>
              )}
              <div className="space-y-6">
                {sectionData?.jobs?.map((job: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-purple-500"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {job.icon ? <span className="text-2xl">{job.icon}</span> : null}
                          <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                          {job.type && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                              {job.type}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-3">
                          {job.location && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              {job.location}
                            </span>
                          )}
                          {job.salary && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              💰 {job.salary}
                            </span>
                          )}
                          {job.experience && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              ⭐ {job.experience}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={job.applyLink || "#"}
                        className="px-6 py-3 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                      style={{
                        background: `linear-gradient(to right, var(--color-primary), var(--color-secondary))`,
                      }}
                      >
                        Apply Now →
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        );

      case "toggle-section":
        const [isOpen, setIsOpen] = useState(sectionData?.defaultOpen || false);
        return (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="px-4 py-12"
            style={sectionStyles}
          >
            <div className="max-w-4xl mx-auto">
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between p-6 rounded-xl hover:shadow-lg transition-all"
                style={{
                  background: `linear-gradient(to right, var(--color-primary)/10, var(--color-secondary)/10)`,
                }}
              >
                <div className="flex items-center gap-4">
                  {sectionData?.icon ? <span className="text-3xl">{sectionData.icon}</span> : null}
                  <h3 className="text-xl font-bold text-gray-900">{sectionData?.title}</h3>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl"
                >
                  {isOpen ? "🔺" : "🔻"}
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-white rounded-b-xl border-t border-gray-200">
                      <div
                        dangerouslySetInnerHTML={{ __html: sectionData?.content || "" }}
                        className="prose prose-lg"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        );

      default:
        return (
          <section 
            className="px-4"
            style={sectionStyles}
          >
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-gray-600 text-sm">
                  Unknown section type: {section.type}
                </p>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(sectionData, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        );
    }
  };

  // Get animation settings from section data or use defaults
  const getAnimationVariants = () => {
    const animationType = section.data?.animationType || "auto";
    
    // If custom animation is set, use it
    if (animationType !== "auto" && animationType !== "none") {
      switch (animationType) {
        case "slideInUp":
          return slideInUp;
        case "slideInDown":
          return slideInDown;
        case "slideInLeft":
          return slideInLeft;
        case "slideInRight":
          return slideInRight;
        case "fadeIn":
          return fadeIn;
        case "fadeInScale":
          return fadeInScale;
        case "reveal":
          return reveal;
        case "rotateIn":
          return rotateIn;
        case "bounceIn":
          return bounceIn;
        default:
          return fadeIn;
      }
    }
    
    // If no animation
    if (animationType === "none") {
      return { hidden: { opacity: 1 }, visible: { opacity: 1 } };
    }
    
    // Auto: Determine animation direction based on index (alternating pattern)
    const animationDirection = index % 4;
    switch (animationDirection) {
      case 0:
        return slideInUp;
      case 1:
        return slideInLeft;
      case 2:
        return slideInRight;
      case 3:
        return fadeInScale;
      default:
        return fadeIn;
    }
  };

  const getAnimationTransition = (): { type: "spring"; stiffness: number; damping: number; delay: number } | { duration: number; delay: number; ease: string } => {
    const duration = section.data?.animationDuration || 0.6;
    const delay = section.data?.animationDelay || 0;
    const easing = section.data?.animationEasing || "easeOut";
    
    if (easing === "spring") {
      return {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay,
      };
    }
    
    return {
      duration,
      delay,
      ease: easing,
    };
  };

  const sectionVariants = getAnimationVariants();
  const animationTransition = getAnimationTransition();
  const animateOnce = section.data?.animationOnce !== false;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: animateOnce, margin: "-100px" }}
      variants={sectionVariants}
      transition={animationTransition}
    >
      {renderSectionContent()}
    </motion.div>
  );
}
