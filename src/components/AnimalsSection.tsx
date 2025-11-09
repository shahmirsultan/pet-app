import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dogPlaceholder from "@/assets/dog-placeholder.jpg";
import catPlaceholder from "@/assets/cat-placeholder.jpg";
import birdPlaceholder from "@/assets/bird-placeholder.jpg";

const AnimalsSection = () => {
  const { data: animals, isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getPlaceholderImage = (type: string) => {
    switch (type) {
      case "dog":
        return dogPlaceholder;
      case "cat":
        return catPlaceholder;
      case "bird":
        return birdPlaceholder;
      default:
        return dogPlaceholder;
    }
  };

  if (isLoading) {
    return (
      <section id="animals" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="animals" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Lovely Animals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each pet is carefully selected and cared for with love. Find your perfect companion today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {animals && animals.length > 0 ? (
            animals.map((animal) => (
              <Card key={animal.id} className="overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-vintage)] transition-all">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={animal.image_url || getPlaceholderImage(animal.type)}
                    alt={animal.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-serif text-2xl">{animal.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">
                      {animal.type}
                    </Badge>
                  </div>
                  <CardDescription>{animal.breed}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    {animal.age_months} {animal.age_months === 1 ? "month" : "months"} old
                  </p>
                  <p className="text-sm">{animal.description}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="font-serif text-2xl font-bold text-primary">
                    ${animal.price}
                  </span>
                  <Button>Learn More</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                No animals available at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnimalsSection;
