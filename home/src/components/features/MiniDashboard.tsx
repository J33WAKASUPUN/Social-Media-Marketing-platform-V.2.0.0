import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, Share2 } from "lucide-react";

const summaryCards = [
  {
    icon: FileText,
    title: "Total Posts",
    value: "13",
    subtext: "+100%",
    color: "violet",
  },
  {
    icon: Clock,
    title: "Scheduled",
    value: "0",
    subtext: "0 posting today",
    color: "amber",
  },
  {
    icon: CheckCircle,
    title: "Published",
    value: "9",
    subtext: "82% success rate",
    color: "emerald",
  },
  {
    icon: Share2,
    title: "Active Channels",
    value: "6",
    subtext: "6 total connected",
    color: "blue",
  },
];

function SummaryCard({ card, index }: { card: typeof summaryCards[0]; index: number }) {
  const colorClasses = {
    violet: "border-violet-500/30 text-violet-400 bg-violet-500/10",
    amber: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    emerald: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    blue: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  };

  const iconBgClasses = {
    violet: "bg-violet-500/20 text-violet-400",
    amber: "bg-amber-500/20 text-amber-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      viewport={{ once: true }}
      className={`p-3 rounded-xl bg-card/50 backdrop-blur-sm border ${colorClasses[card.color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBgClasses[card.color as keyof typeof iconBgClasses]}`}>
          <card.icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs text-muted-foreground">{card.title}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{card.value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{card.subtext}</div>
    </motion.div>
  );
}

export function MiniDashboard() {
  return (
    <div className="mt-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {summaryCards.map((card, index) => (
          <SummaryCard key={card.title} card={card} index={index} />
        ))}
      </div>
    </div>
  );
}
