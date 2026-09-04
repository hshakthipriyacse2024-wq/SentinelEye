import { motion } from "framer-motion";
import {
  Scan,
  Shield,
  Zap,
  Clock,
  Database,
  Smartphone,
  Lock,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Real-time Face Detection",
    description:
      "Advanced AI algorithms detect and track multiple faces simultaneously with high precision.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Shield,
    title: "Anti-Spoofing Protection",
    description:
      "Liveness detection prevents photo, video, or mask-based impersonation attempts.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description:
      "Sub-second recognition speed ensures smooth exam entry without delays.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Clock,
    title: "Automated Timestamping",
    description:
      "Precise time and date logging for complete audit trails and reporting.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Database,
    title: "Secure Data Storage",
    description:
      "Encrypted database with facial embeddings and attendance records.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Smartphone,
    title: "Mobile Dashboard",
    description:
      "Responsive web interface for administrators to monitor attendance remotely.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Lock,
    title: "Privacy Compliant",
    description:
      "Built with data protection principles and GDPR compliance in mind.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Comprehensive reporting with attendance patterns and statistics.",
    gradient: "from-secondary to-primary",
  },
];

const techStack = [
  "Python",
  "TensorFlow",
  "OpenCV",
  "React",
  "Node.js",
  "PostgreSQL",
  "WebRTC",
  "Docker",
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative bg-muted/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono mb-4">
            CAPABILITIES
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Features & Technology Stack
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge technologies combined to deliver a robust and reliable
            facial recognition system.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group card-hover"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-orbitron text-base font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="font-orbitron text-lg font-semibold mb-6">
            Powered By
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full bg-card border border-border font-mono text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
