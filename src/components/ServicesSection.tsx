import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const ServicesSection = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section id="services" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Professional Pet Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert care and attention for your beloved companions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services && services.length > 0 ? (
            services.map((service) => (
              <Card key={service.id} className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-vintage)] transition-all">
                {service.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">{service.name}</CardTitle>
                  {service.duration_minutes && (
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {service.duration_minutes} minutes
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold text-primary">
                    ${service.price}
                  </span>
                  <Button>Book Now</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                No services available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
