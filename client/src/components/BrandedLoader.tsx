import { motion } from 'framer-motion';

export const BrandedLoader = () => {
  return (
    // Uses 'bg-background' to match your theme (white in light mode, dark gray in dark mode)
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background transition-colors duration-300">
      <div className="flex flex-col items-center">
        
        {/* Logo Container with Simple Pulse */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          {/* Subtle Primary Glow (uses your --primary color) */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 rounded-full bg-primary blur-2xl"
          />

          {/* Logo Image */}
          <div className="relative z-10 h-24 w-24 overflow-hidden rounded-xl bg-card shadow-elevated ring-1 ring-border">
            <img 
              src="/logo.png" 
              alt="SocialFlow" 
              className="h-full w-full object-cover p-2"
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            SocialFlow
          </h1>
          
          <p className="text-sm text-muted-foreground">
            Loading your workspace...
          </p>
        </motion.div>

        {/* Minimal 3-Second Progress Bar */}
        <div className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 3, // Forces the visual cycle to take 3 seconds
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-full bg-primary"
          />
        </div>
      </div>
    </div>
  );
};