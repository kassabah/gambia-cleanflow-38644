import { Card } from "@/components/ui/card";
import { MapPin, Camera, Clock, Smartphone, Shield, BarChart3 } from "lucide-react";

const FeatureSection = () => {
  const features = [
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Track collection trucks and monitor service progress in real-time using GPS technology",
      color: "primary"
    },
    {
      icon: Camera,
      title: "Photo Reporting",
      description: "Report illegal dumping with photo evidence and GPS location for quick response",
      color: "secondary"
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Book sewage disposal services at your convenience with automated scheduling",
      color: "accent"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for affordable smartphones with low data usage requirements",
      color: "primary"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security ensuring your data and privacy are protected",
      color: "secondary"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Generate comprehensive reports for better city planning and resource allocation",
      color: "accent"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Modern Solutions for Waste Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering Gambian communities with technology-driven waste management solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur">
                <div className={`w-12 h-12 mb-4 bg-gradient-${feature.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;