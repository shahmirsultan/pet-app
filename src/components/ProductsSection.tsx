import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductsSection = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vaccines_medicines: "Vaccines & Medicines",
      food: "Pet Food",
      accessories: "Accessories",
    };
    return labels[category] || category;
  };

  const filterByCategory = (category: string) => {
    return products?.filter((p) => p.category === category) || [];
  };

  if (isLoading) {
    return (
      <section id="products" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Premium Pet Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything your pet needs for a healthy and happy life.
          </p>
        </div>

        <Tabs defaultValue="vaccines_medicines" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="vaccines_medicines">Vaccines & Medicines</TabsTrigger>
            <TabsTrigger value="food">Pet Food</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
          </TabsList>

          {["vaccines_medicines", "food", "accessories"].map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filterByCategory(category).length > 0 ? (
                  filterByCategory(category).map((product) => (
                    <Card key={product.id} className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-vintage)] transition-all">
                      {product.image_url && (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="outline" className="w-fit">
                          {getCategoryLabel(product.category)}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between">
                        <span className="font-serif text-xl font-bold text-primary">
                          ${product.price}
                        </span>
                        <Button size="sm">Add to Cart</Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">
                      No products in this category yet.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ProductsSection;
