import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Camera, Truck, Users, BarChart3, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Hero Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Smart Waste Management in The Gambia"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70"></div>
      </div>

      <div className="relative container px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Smart Sewage & Waste Management
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Connecting communities across The Gambia for cleaner, healthier environments
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Get Started Today
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur border-2 hover:border-primary/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Residents</h3>
              <p className="text-muted-foreground mb-6">
                Book sewage disposal services and report illegal dumping in your community
              </p>
              <Button variant="gambian" className="w-full">
                Access Resident Portal
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur border-2 hover:border-secondary/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-secondary rounded-2xl flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Collectors</h3>
              <p className="text-muted-foreground mb-6">
                Receive job assignments and track your collection routes efficiently
              </p>
              <Button variant="secondary" className="w-full">
                Collector Dashboard
              </Button>
            </div>
          </Card>

          <Card className="p-8 hover:shadow-strong transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur border-2 hover:border-accent/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Administrators</h3>
              <p className="text-muted-foreground mb-6">
                Monitor operations and generate reports for better city management
              </p>
              <Button variant="accent" className="w-full">
                Admin Console
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Active Residents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Collection Trucks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">1,200+</div>
            <div className="text-sm text-muted-foreground">Jobs Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">12</div>
            <div className="text-sm text-muted-foreground">Regions Covered</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;