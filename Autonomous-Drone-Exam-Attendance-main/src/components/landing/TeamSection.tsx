import { motion } from "framer-motion";
import { User, GraduationCap, Award } from "lucide-react";

const teamMembers = [
  {
    name: "H Shakthi Priya",
    role: "System Architecture & AI",
    avatar: "SP",
  },
  {
    name: "B Sakthi Priyan",
    role: "Drone Integration",
    avatar: "BP",
  },
  {
    name: "Hema Harini H",
    role: "Frontend & UI/UX",
    avatar: "HH",
  },
  {
    name: "Harini J",
    role: "Backend & Database",
    avatar: "HJ",
  },
];

export const TeamSection = () => {
  return (
    <section id="team" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono mb-4">
            OUR TEAM
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Team & Credits
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A dedicated team of innovators bringing autonomous verification to
            educational institutions.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-border flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <span className="font-orbitron text-xl font-bold text-primary">
                  {member.avatar}
                </span>
              </div>
              <h4 className="font-orbitron font-semibold text-sm mb-1">
                {member.name}
              </h4>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </motion.div>
          ))}
        </div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <h3 className="font-orbitron text-lg font-semibold mb-2">
              Academic Project
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Developed for CSE Department Project
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
                Computer Science Engineering
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
                2025-2026
              </span>
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
                IOT and drone
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
