import { motion } from "framer-motion";
import { Camera, Cpu, Database, Monitor, ArrowRight, Wifi } from "lucide-react";

const architectureSteps = [
  {
    icon: Camera,
    title: "Drone Camera",
    description: "4K camera captures student faces",
    color: "primary",
  },
  {
    icon: Wifi,
    title: "Data Transmission",
    description: "Encrypted wireless stream",
    color: "primary",
  },
  {
    icon: Cpu,
    title: "AI Processing",
    description: "Face detection & recognition",
    color: "primary",
  },
  {
    icon: Database,
    title: "Database",
    description: "Student records & embeddings",
    color: "primary",
  },
  {
    icon: Monitor,
    title: "Dashboard",
    description: "Real-time attendance display",
    color: "primary",
  },
];

export const ArchitectureSection = () => {
  return (
    <section id="architecture" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono mb-4">
            SYSTEM DESIGN
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            System Architecture
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive end-to-end pipeline from drone capture to attendance
            verification.
          </p>
        </motion.div>

        {/* Desktop Architecture Flow */}
        <div className="hidden lg:flex items-center justify-center gap-2 max-w-6xl mx-auto mb-16">
          {architectureSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center mb-4 transition-all hover:scale-105 ${
                    step.color === "primary"
                      ? "border-primary bg-primary/10"
                      : "border-secondary bg-secondary/20"
                  }`}
                >
                  <step.icon
                    className={`w-10 h-10 ${
                      step.color === "primary" ? "text-primary" : "text-secondary"
                    }`}
                  />
                </div>
                <h4 className="font-orbitron text-sm font-semibold text-center mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground text-center max-w-[120px]">
                  {step.description}
                </p>
              </div>
              {index < architectureSteps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-muted-foreground mx-4 flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile Architecture Flow */}
        <div className="lg:hidden space-y-4 max-w-sm mx-auto">
          {architectureSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center flex-shrink-0 ${
                  step.color === "primary"
                    ? "border-primary bg-primary/10"
                    : "border-secondary bg-secondary/20"
                }`}
              >
                <step.icon
                  className={`w-7 h-7 ${
                    step.color === "primary" ? "text-primary" : "text-secondary"
                  }`}
                />
              </div>
              <div>
                <h4 className="font-orbitron text-sm font-semibold">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical specs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { label: "Camera Resolution", value: "4K Ultra HD" },
            { label: "Processing Time", value: "<100ms" },
            { label: "Recognition Model", value: "TensorFlow.js" },
            { label: "Communication", value: "WebRTC/RTSP" },
          ].map((spec, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl bg-card border border-border"
            >
              <div className="font-mono text-xs text-muted-foreground uppercase mb-1">
                {spec.label}
              </div>
              <div className="font-orbitron font-semibold text-primary">
                {spec.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
