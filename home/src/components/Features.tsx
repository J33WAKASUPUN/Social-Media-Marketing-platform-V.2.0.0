import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, Calendar, MessageCircle, Image, Users } from "lucide-react";
import { MiniDashboard } from "./features/MiniDashboard";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

function MiniChart() {
  return (
    <div className="mt-4 h-24 flex items-end gap-1">
      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${height}%` }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          viewport={{ once: true }}
          className="flex-1 rounded-sm bg-gradient-to-t from-violet-600/60 to-purple-500/60"
        />
      ))}
    </div>
  );
}

function MiniCalendar() {
  return (
    <div className="mt-4 grid grid-cols-7 gap-1">
      {[...Array(28)].map((_, i) => (
        <div
          key={i}
          className={`aspect-square rounded-sm ${
            [3, 8, 12, 15, 19, 24].includes(i)
              ? "bg-primary/60"
              : "bg-muted-foreground/10"
          }`}
        />
      ))}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Features
          </span>
          <h2 className="section-heading mt-4 mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Dominate Social</span>
          </h2>
          <p className="section-subheading mx-auto">
            A complete toolkit for managing your social media presence, 
            from scheduling to analytics.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-4 md:space-y-6"
        >
          {/* Row 1: Unified Dashboard - Full Width */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="card-glass group p-6 border-violet-500/30 hover:border-violet-500/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Unified Dashboard</h3>
                <p className="text-muted-foreground text-sm">Real-time overview of your performance across all platforms.</p>
              </div>
            </div>
            <MiniDashboard />
          </motion.div>

          {/* Row 2: WhatsApp + Team Collaboration - 50/50 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* WhatsApp Integration */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6 border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-emerald-500/10 text-emerald-500">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp Integration</h3>
              <p className="text-muted-foreground">Connect directly with customers via WhatsApp Business.</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  1,200+ connected
                </span>
              </div>
            </motion.div>

            {/* Team Collaboration */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6 border-violet-500/30 hover:border-violet-500/50 bg-violet-500/5"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">Work together with approval workflows.</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["JD", "MK", "SA"].map((initials, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-violet-500/20 border-2 border-card flex items-center justify-center text-xs font-semibold text-violet-400"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Approved
                </span>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Analytics, Calendar, Media Library */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Smart Analytics */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-muted-foreground">Deep insights into post performance with AI recommendations.</p>
              <MiniChart />
            </motion.div>

            {/* Visual Calendar */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Calendar</h3>
              <p className="text-muted-foreground">Drag-and-drop scheduling that teams love.</p>
              <MiniCalendar />
            </motion.div>

            {/* Media Library */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Image className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Media Library</h3>
              <p className="text-muted-foreground">1TB storage for your creative assets.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-muted-foreground/10"
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
