import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const data = [
  { value: 400 },
  { value: 300 },
  { value: 600 },
  { value: 800 },
  { value: 500 },
  { value: 900 },
  { value: 700 },
  { value: 1100 },
  { value: 600 },
  { value: 1200 },
  { value: 1000 },
  { value: 1400 },
];

export function RealAnalyticsChart() {
  return (
    <div className="mt-4 space-y-3">
      {/* Chart */}
      <div className="h-80 -mx-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#colorGradient)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Impressions", value: "24.5K", change: "+18%" },
          { label: "Engagement", value: "3.2K", change: "+12%" },
          { label: "Clicks", value: "892", change: "+24%" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            viewport={{ once: true }}
            className="rounded-lg bg-muted/90 p-5 text-center"
          >
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-500 font-semibold">
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}