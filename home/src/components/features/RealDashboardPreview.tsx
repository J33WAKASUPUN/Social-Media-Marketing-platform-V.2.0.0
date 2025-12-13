import { motion } from "framer-motion";
import { TrendingUp, Users, FileText, Calendar } from "lucide-react";

const stats = [
  { label: "Total Posts", value: "2,847", trend: "+12.5%", icon: FileText, color: "violet" },
  { label: "Scheduled", value: "23", trend: "This week", icon: Calendar, color: "amber" },
  { label: "Published", value: "1,879", trend: "+8.3%", icon: TrendingUp, color: "emerald" },
  { label: "Channels", value: "", trend: "+15.7%", icon: Users, color: "blue" },
];

const colorClasses = {
  violet: "from-violet-500 to-purple-600",
  emerald: "from-emerald-500 to-green-600",
  blue: "from-blue-500 to-cyan-600",
  amber: "from-amber-500 to-orange-600",
};

export function RealDashboardPreview() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-xl bg-card border border-border p-4 hover:shadow-lg transition-all"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} opacity-5`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {stat.trend}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}