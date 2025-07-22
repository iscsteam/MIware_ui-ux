import FlipCard from "./FlipCard";

const FeaturesGrid = () => {
  const features = [
    {
      icon: "📱",
      title: "Custom Apps",
      backText: "We build tailored apps to automate workflows and boost productivity.",
      ctaText: "App Solutions"
    },
    {
      icon: "📊",
      title: "Data Analytics",
      backText: "Turn raw data into insights that drive smarter decisions.",
      ctaText: "Analytics Services"
    },
    {
      icon: "☁️",
      title: "Cloud Integration",
      backText: "Seamlessly link on-prem, cloud, and hybrid systems.",
      ctaText: "Cloud & DevOps"
    },
    {
      icon: "🔐",
      title: "Security & Compliance",
      backText: "Safeguard IP and meet industry regulations with ease.",
      ctaText: "Security Audit"
    },
    {
      icon: "🛠️",
      title: "Out-of-the-Box Suites",
      backText: "Deploy proven ERP, POS, and HR suites in weeks, not months.",
      ctaText: "Product Catalog"
    },
    {
      icon: "🤝",
      title: "Consult & Support",
      backText: "24/7 support and SLA-backed delivery keep you online.",
      ctaText: "Support Plans"
    }
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-6">
            Everything your business needs
          </h2>
          <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
            From custom development to ready-made solutions, we deliver technology that scales with your ambitions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <FlipCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              backText={feature.backText}
              ctaText={feature.ctaText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;