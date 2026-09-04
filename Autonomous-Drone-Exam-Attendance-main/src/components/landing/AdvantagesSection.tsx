import { motion } from "framer-motion";
import { TrendingUp, Lightbulb, Rocket } from "lucide-react";

const advantages = [
  "Eliminates manual verification bottlenecks",
  "Prevents proxy attendance and impersonation",
  "Reduces administrative workload by 80%",
  "Provides real-time attendance insights",
  "Creates immutable audit trails",
  "Scales effortlessly to large events",
];

const outputs = [
  "Real-time attendance dashboard",
  "PDF attendance reports",
  "Student verification logs",
  "Anomaly detection alerts",
  "Statistical analytics",
  "API for integration",
];

const futureEnhancements = [
  {
    title: "Multi-Drone Coordination",
    description: "Swarm technology for covering larger venues simultaneously.",
  },
  {
    title: "Emotion Detection",
    description: "Monitor student stress levels during exams for well-being insights.",
  },
  {
    title: "Voice Integration",
    description: "Multi-modal verification combining face and voice recognition.",
  },
  {
    title: "Blockchain Logging",
    description: "Immutable attendance records using distributed ledger technology.",
  },
];

export const AdvantagesSection = () => {
  return (
    <section id="advantages" className="py-24 relative bg-muted/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Advantages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-card border border-border"
          >
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-orbitron text-xl font-bold mb-6">Advantages</h3>
            <ul className="space-y-3">
              {advantages.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Outputs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl bg-card border border-border"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-orbitron text-xl font-bold mb-6">System Outputs</h3>
            <ul className="space-y-3">
              {outputs.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Future Enhancements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl bg-card border border-border"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
              <Rocket className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-orbitron text-xl font-bold mb-6">
              Future Enhancements
            </h3>
            <ul className="space-y-4">
              {futureEnhancements.map((item, index) => (
                <li key={index}>
                  <h4 className="font-semibold text-sm text-foreground mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
