import { Zap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-orbitron text-xl font-bold">
              DRONE<span className="text-primary">SCAN</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Autonomous Drone Facial Recognition System for Automated Exam Entry
            and Attendance Reporting. A cutting-edge solution for modern
            educational institutions.
          </p>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 DroneAttend. Department Project Presentation.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Built with AI • React • TensorFlow.js
          </p>
        </div>
      </div>
    </footer>
  );
};
