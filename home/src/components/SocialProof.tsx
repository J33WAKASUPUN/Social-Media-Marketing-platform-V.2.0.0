import { motion } from "framer-motion";

const companies = [
  "Acme Inc",
  "Globex",
  "Soylent",
  "Initech",
  "Umbrella",
  "Hooli",
  "Massive Dynamic",
  "Cyberdyne",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export function SocialProof() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Trusted Worldwide
          </span>
          <h2 className="section-heading mt-4">
            Trusted by <span className="gradient-text">Creative Agencies</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {companies.map((company) => (
            <motion.div
              key={company}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="group h-20 md:h-24 rounded-2xl glass-card flex items-center justify-center cursor-pointer"
            >
              <div className="text-xl md:text-2xl font-bold text-muted-foreground/50 group-hover:text-foreground group-hover:gradient-text transition-all duration-300">
                {company}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "50K+", label: "Active Users" },
            { value: "10M+", label: "Posts Scheduled" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "4.9/5", label: "Customer Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
