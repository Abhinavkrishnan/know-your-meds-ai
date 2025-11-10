import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border py-12 px-6 mt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">MediInfo</span>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Important:</strong> This platform provides educational information only. 
              It does not offer medical advice, diagnosis, or treatment recommendations. 
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Always consult qualified healthcare professionals for any medical concerns. 
              In case of emergency, contact emergency services immediately.
            </p>
          </div>

          <div className="pt-6 border-t border-border space-y-2">
            <p className="text-sm text-muted-foreground">
              © 2025 MediInfo. Educational Disease Information Platform.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Kanak • Abhinavkrishnan • Araslan • Aiswarya • Mayuri
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
