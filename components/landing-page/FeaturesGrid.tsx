import FlipCard from "./FlipCard";

const FeaturesGrid = () => {
  const features = [
    {
    
      title: "Custom Apps",
      frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      backText:
        "We build tailored apps to automate workflows and boost productivity.",
      ctaText: "App Solutions",
    },
    {
     
      title: "Data Analytics",
      frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      backText: "Turn raw data into insights that drive smarter decisions.",
      ctaText: "Analytics Services",
    },
    {
    
      title: "Cloud Integration",
      frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      backText: "Seamlessly link on-prem, cloud, and hybrid systems.",
      ctaText: "Cloud & DevOps",
    },
    {
     
      title: "Security & Compliance",
      frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      backText: "Safeguard IP and meet industry regulations with ease.",
      ctaText: "Security Audit",
    },
    {
     
      title: "Out-of-the-Box Suites",
      frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      backText: "Deploy proven ERP, POS, and HR suites in weeks, not months.",
      ctaText: "Product Catalog",
    },
    {
    
      title: "Consult & Support",
      frontImg : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
      backText: "24/7 support and SLA-backed delivery keep you online.",
      ctaText: "Support Plans",
    },
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-6">
            Everything your business needs
          </h2>
          <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
            From custom development to ready-made solutions, we deliver
            technology that scales with your ambitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <FlipCard
              key={index}
            
              title={feature.title}
              backText={feature.backText}
              frontImg={feature.frontImg}
              ctaText={feature.ctaText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
