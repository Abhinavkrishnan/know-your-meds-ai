import { Shield, BookOpen, Heart } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-medical-sage-light text-medical-sage text-sm font-medium">
            <Shield className="w-4 h-4" />
            Educational Information Only
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight tracking-tight">
            Understand Diseases.
            <br />
            <span className="text-primary">Stay Informed.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Access professional, evidence-based disease information. Get clear, factual answers about health conditions from our AI-powered educational platform.
          </p>

          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Factual</p>
                <p className="text-sm text-muted-foreground">Evidence-based</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-medical-blue/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-medical-blue" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Safe</p>
                <p className="text-sm text-muted-foreground">No medical advice</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-medical-sage/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-medical-sage" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Professional</p>
                <p className="text-sm text-muted-foreground">Quality content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
