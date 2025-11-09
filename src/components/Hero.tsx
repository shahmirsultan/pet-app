import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      </div>

      <div className="container relative z-10 px-4">
        <div className="max-w-2xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Welcome to Paws & Whiskers
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Your trusted vintage pet store since 1950. Quality pets, premium supplies, and loving care.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="#animals">Browse Animals</a>
            </Button>
            <Button size="lg" variant="outline">
              <a href="#contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
