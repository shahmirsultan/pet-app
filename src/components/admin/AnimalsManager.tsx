import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

type Animal = {
  id: string;
  name: string;
  type: "dog" | "cat" | "bird" | "other";
  breed: string | null;
  age_months: number | null;
  price: number | null;
  description: string | null;
  image_url: string | null;
  available: boolean | null;
};

export const AnimalsManager = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [formData, setFormData] = useState<Partial<Animal>>({
    name: "",
    type: "dog",
    breed: "",
    age_months: 0,
    price: 0,
    description: "",
    image_url: "",
    available: true,
  });

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      toast.error("Failed to fetch animals");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error("Name and type are required");
      return;
    }
    
    try {
      if (editingAnimal) {
        const { error } = await supabase
          .from("animals")
          .update(formData)
          .eq("id", editingAnimal.id);

        if (error) throw error;
        toast.success("Animal updated successfully");
      } else {
        const { error } = await supabase.from("animals").insert([{
          name: formData.name,
          type: formData.type,
          breed: formData.breed || null,
          age_months: formData.age_months || null,
          price: formData.price || null,
          description: formData.description || null,
          image_url: formData.image_url || null,
          available: formData.available ?? true,
        }]);

        if (error) throw error;
        toast.success("Animal added successfully");
      }

      setOpen(false);
      resetForm();
      fetchAnimals();
    } catch (error) {
      toast.error("Failed to save animal");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this animal?")) return;

    try {
      const { error } = await supabase.from("animals").delete().eq("id", id);

      if (error) throw error;
      toast.success("Animal deleted successfully");
      fetchAnimals();
    } catch (error) {
      toast.error("Failed to delete animal");
    }
  };

  const openEditDialog = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData(animal);
    setOpen(true);
  };

  const resetForm = () => {
    setEditingAnimal(null);
    setFormData({
      name: "",
      type: "dog",
      breed: "",
      age_months: 0,
      price: 0,
      description: "",
      image_url: "",
      available: true,
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Manage Animals</h2>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAnimal ? "Edit Animal" : "Add New Animal"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed || ""}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age_months">Age (months)</Label>
                <Input
                  id="age_months"
                  type="number"
                  value={formData.age_months || ""}
                  onChange={(e) => setFormData({ ...formData, age_months: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available ?? true}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingAnimal ? "Update" : "Add"} Animal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animals.map((animal) => (
              <TableRow key={animal.id}>
                <TableCell>{animal.name}</TableCell>
                <TableCell className="capitalize">{animal.type}</TableCell>
                <TableCell>{animal.breed || "-"}</TableCell>
                <TableCell>{animal.age_months ? `${animal.age_months} months` : "-"}</TableCell>
                <TableCell>${animal.price?.toFixed(2) || "-"}</TableCell>
                <TableCell>{animal.available ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(animal)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(animal.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
