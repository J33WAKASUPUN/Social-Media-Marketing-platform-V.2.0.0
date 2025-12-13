import { motion } from "framer-motion";

const days = ["S", "M", "T", "W", "T", "F", "S"];
const scheduledDates = [5, 8, 12, 15, 19, 22, 24, 28];

export function RealCalendarPreview() {
  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-semibold">December 2024</span>
        <div className="flex gap-1">
          <button className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center text-xs">
            ‹
          </button>
          <button className="w-6 h-6 rounded hover:bg-muted flex items-center justify-center text-xs">
            ›
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="aspect-square flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => {
          const date = i - 2; // Start from -2 to show previous month's end
          const isCurrentMonth = date >= 1 && date <= 31;
          const isScheduled = scheduledDates.includes(date);
          const isToday = date === 13;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              viewport={{ once: true }}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs relative ${
                !isCurrentMonth
                  ? "text-muted-foreground/30"
                  : isToday
                  ? "bg-blue-600 text-white font-bold" // Changed from bg-primary
                  : isScheduled
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold"
                  : "hover:bg-muted"
              }`}
            >
              {isCurrentMonth && date}
              {isScheduled && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-600" /> {/* Changed from bg-primary */}
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-muted-foreground">Scheduled</span>
        </div>
      </div>
    </div>
  );
}