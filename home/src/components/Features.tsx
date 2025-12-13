import { motion } from "framer-motion";
import { LayoutDashboard, BarChart3, Calendar, MessageCircle, Image, Users } from "lucide-react";
import { RealDashboardPreview } from "./features/RealDashboardPreview";
import { RealAnalyticsChart } from "./features/RealAnalyticsChart";
import { RealCalendarPreview } from "./features/RealCalendarPreview";
import { RealMediaLibrary } from "./features/RealMediaLibrary";

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
            className="card-glass group p-6 border-violet-500/30 hover:border-violet-500/50 relative overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Unified Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Real-time overview of your performance across all platforms</p>
                </div>
              </div>
              <RealDashboardPreview />
            </div>
          </motion.div>

          {/* Row 2: WhatsApp + Team Collaboration - 50/50 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* WhatsApp Integration */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6 border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">WhatsApp Integration</h3>
                <p className="text-muted-foreground mb-4">Connect directly with customers via WhatsApp Business API</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Automated messaging</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Contact management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Template messages</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    1,200+ businesses connected
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Team Collaboration */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6 border-violet-500/30 hover:border-violet-500/50 bg-violet-500/5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground mb-4">Work together with role-based permissions and approval workflows</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span className="text-muted-foreground">Role-based access control</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span className="text-muted-foreground">Approval workflows</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span className="text-muted-foreground">Activity tracking</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["JD", "MK", "SA"].map((initials, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 border-2 border-card flex items-center justify-center text-xs font-semibold text-white shadow-lg"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Team ready
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Analytics, Calendar, Media Library */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Smart Analytics */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground mb-1">Track performance with detailed insights</p>
                <RealAnalyticsChart />
              </div>
            </motion.div>

            {/* Visual Calendar */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Visual Calendar</h3>
                <p className="text-sm text-muted-foreground mb-1">Plan content with drag-and-drop scheduling</p>
                <RealCalendarPreview />
              </div>
            </motion.div>

            {/* Media Library */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="card-glass group p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-pink-600 to-rose-600 shadow-lg group-hover:scale-110 transition-transform">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Media Library</h3>
                <p className="text-sm text-muted-foreground mb-1">Store and organize your creative assets</p>
                <RealMediaLibrary />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}