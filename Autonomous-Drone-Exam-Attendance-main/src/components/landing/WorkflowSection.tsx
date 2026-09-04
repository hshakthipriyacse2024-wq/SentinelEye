import { motion } from "framer-motion";
import { UserCheck, Clock, FileCheck, Bell } from "lucide-react";

const workflowSteps = [
  {
    step: "01",
    icon: UserCheck,
    title: "Student Enrollment",
    description:
      "Students register with their photo and details. Facial embeddings are generated and stored securely.",
  },
  {
    step: "02",
    icon: Clock,
    title: "Exam Day Scan",
    description:
      "Drone autonomously scans students entering through the exam gate. Real-time face matching occurs.",
  },
  {
    step: "03",
    icon: FileCheck,
    title: "Attendance Logged",
    description: (
      <>
        Students marked as <span className="text-green-500 font-semibold">present</span> are
        automatically logged with timestamp and gate location.
      </>
    ),
  },
  {
    step: "04",
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Administrators receive notifications for unrecognized faces or attendance anomalies.",
  },
];

const useCases = [
  {
    title: "University Examinations",
    description: "Large-scale exam attendance for universities with multiple gates.",
  },
  {
    title: "Certification Tests",
    description: "High-security identity verification for professional certifications.",
  },
  {
    title: "Corporate Training",
    description: "Attendance tracking for mandatory corporate training sessions.",
  },
  {
    title: "Conference Check-in",
    description: "Streamlined registration for conferences and large events.",
  },
];

export const WorkflowSection = () => {
  return (
    <section id="workflow" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono mb-4">
            PROCESS
          </span>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Workflow & Use Cases
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A streamlined process from enrollment to verification, adaptable
            to various scenarios.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {workflowSteps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="p-6 rounded-xl bg-card border border-border h-full">
                <div className="font-orbitron text-4xl font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-orbitron text-lg font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Use Cases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="font-orbitron text-xl font-semibold text-center mb-8">
            Application Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-all"
              >
                <h4 className="font-orbitron font-semibold text-sm mb-1">
                  {useCase.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
