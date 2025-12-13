import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [0, 15]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // ✅ DETECT THEME (Dark or Light)
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if dark mode is active
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-12 md:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Now with AI-powered scheduling</span>
          </motion.div>

          {/* Headline */}
          <h1 className="section-heading mb-6">
            Manage All Your{" "}
            <span className="gradient-text">Social Media</span>{" "}
            in One Place
          </h1>

          {/* Subheadline */}
          <p className="section-subheading mx-auto mb-8">
            Schedule posts, track analytics, and grow your audience across LinkedIn, 
            Facebook, Instagram, Twitter, YouTube, and WhatsApp Business.
          </p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="https://socialflow-51u9.onrender.com/register"
              className="btn-primary flex items-center gap-2 text-base animate-glow"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </a>
            {/* <a
              href="#demo"
              className="btn-ghost flex items-center gap-2 text-base group"
            >
              <Play className="w-4 h-4" />
              View Demo
              <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </a> */}
          </motion.div>
        </motion.div>

        {/* ... inside your Hero component ... */}

{/* ✅ DASHBOARD PREVIEW WITH REAL IMAGES */}
<motion.div
  style={{ y, rotateX, scale, opacity }}
  className="relative max-w-5xl mx-auto perspective-1000"
>
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.8 }}
    className="relative"
  >
    {/* Glow Effect */}
    <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 to-purple-600/30 rounded-3xl blur-2xl opacity-50" />
    
    {/* Dashboard Card */}
    <div className="relative glass-card rounded-2xl md:rounded-3xl p-2 md:p-4 border border-primary/20">
      <div className="bg-card rounded-xl md:rounded-2xl overflow-hidden">
        {/* Mock Dashboard Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
              dashboard.socialflow.io
            </div>
          </div>
        </div>
        
        {/* ✅ FIXED: Grid layout allows images to define height naturally */}
        <div className="relative grid grid-cols-1 overflow-hidden bg-muted">
          
          {/* Light Mode Image */}
          <motion.img
            key="light"
            src="/dashboard-light.jpg" 
            alt="SocialFlow Dashboard - Light Mode"
            className={`col-start-1 row-start-1 w-full h-auto object-contain transition-opacity duration-500 ${
              isDark ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
          />
          
          {/* Dark Mode Image */}
          <motion.img
            key="dark"
            src="/dashboard-dark.jpg"
            alt="SocialFlow Dashboard - Dark Mode"
            className={`col-start-1 row-start-1 w-full h-auto object-contain transition-opacity duration-500 ${
              isDark ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />

        </div>
      </div>
    </div>
  </motion.div>
</motion.div>
      </div>
    </section>
  );
}