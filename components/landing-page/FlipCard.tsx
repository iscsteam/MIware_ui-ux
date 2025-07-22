import { ArrowLeft, ArrowRight } from "lucide-react";

interface FlipCardProps {
  icon: string;
  title: string;
  backText: string;
  ctaText: string;
}

const FlipCard = ({ icon, title, backText, ctaText }: FlipCardProps) => {
  return (
    <div className="flip-card" tabIndex={0}>
      <div className="flip-card-inner">
        {/* Front Side */}
        <div className="flip-card-front">
          <div className="text-center">
            <div className="text-6xl mb-4">{icon}</div>
            <h3 className="font-poppins font-semibold text-xl text-foreground">
              {title}
            </h3>
          </div>
          <div className="text-center text-sm text-muted-foreground font-medium">
            Tap to learn more
          </div>
        </div>
        
        {/* Back Side */}
        <div className="flip-card-back">
          <div className="flex items-start justify-between mb-4">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <div className="text-2xl">{icon}</div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <p className="font-inter text-foreground leading-relaxed mb-6">
              {backText}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary">{ctaText}</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;