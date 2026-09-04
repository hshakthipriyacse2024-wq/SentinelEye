import { motion } from "framer-motion";
import { AlertTriangle, Clock, Users, FileX } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Time-Consuming Verification",
    description:
      "Manual identity checks at exam gates create long queues and delays, wasting valuable examination time.",
  },
  {
    icon: Users,
    title: "Proxy Attendance Issues",
    description:
      "Traditional methods fail to prevent impersonation and proxy attendance, compromising exam integrity.",
  },
  {
    icon: FileX,
    title: "Manual Record Errors",
    description:
      "Paper-based attendance systems are prone to errors, loss, and manipulation of records.",
  },
  {
    icon: AlertTriangle,
    title: "Security Vulnerabilities",
    description:
      "Lack of automated verification exposes institutions to identity fraud and security breaches.",
  },
];

export const ProblemSection = () => {
  return (
    <section id="problem" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-mono mb-4">
            THE CHALLENGE
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Problem Statement
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Educational institutions face significant challenges in managing exam
            attendance and identity verification efficiently.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-destructive/50 transition-all group card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-orbitron text-lg font-semibold mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
