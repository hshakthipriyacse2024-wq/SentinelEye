import { motion } from "framer-motion";
import { Bot, Camera, Brain, CheckCircle, Wifi, Database } from "lucide-react";

export const SolutionSection = () => {
  return (
    <section id="solution" className="py-24 relative bg-muted/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-success/10 text-success text-sm font-mono mb-4">
            OUR SOLUTION
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Proposed Drone + AI Solution
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            An autonomous drone equipped with advanced facial recognition technology
            for seamless identity verification and attendance tracking.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Drone Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-card to-muted border border-border p-8 relative overflow-hidden">
              {/* HUD Overlay */}
              <div className="absolute inset-4 border border-primary/30 rounded-xl hud-corners" />
              
              {/* Central drone icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary/10 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Bot className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>

              {/* Floating icons */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-8 right-8 w-12 h-12 rounded-lg bg-card border border-primary/30 flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-primary" />
              </motion.div>
              
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-8 left-8 w-12 h-12 rounded-lg bg-card border border-secondary/30 flex items-center justify-center"
              >
                <Brain className="w-6 h-6 text-secondary" />
              </motion.div>

              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute top-8 left-8 w-12 h-12 rounded-lg bg-card border border-success/30 flex items-center justify-center"
              >
                <Wifi className="w-6 h-6 text-success" />
              </motion.div>

              <motion.div
                animate={{ y: [3, -3, 3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute bottom-8 right-8 w-12 h-12 rounded-lg bg-card border border-accent/30 flex items-center justify-center"
              >
                <Database className="w-6 h-6 text-accent" />
              </motion.div>

              {/* Scan line effect */}
              <div className="absolute inset-0 scan-line opacity-50" />
            </div>
          </motion.div>

          {/* Right: Features list */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                title: "Autonomous Drone Navigation",
                description:
                  "Self-navigating drone patrols exam gates, scanning students without human intervention.",
              },
              {
                title: "Real-time Face Recognition",
                description:
                  "AI-powered facial recognition with 99.2% accuracy for instant identity verification.",
              },
              {
                title: "Automated Attendance Logging",
                description:
                  "Instant attendance marking with timestamp, location, and verification status.",
              },
              {
                title: "Secure Data Transmission",
                description:
                  "Encrypted wireless communication for secure data transfer to central servers.",
              },
              {
                title: "Anti-Spoofing Technology",
                description:
                  "Advanced liveness detection to prevent photo or video-based impersonation attempts.",
              },
            ].map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-orbitron font-semibold mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
