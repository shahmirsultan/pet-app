import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PawPrint, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NavigationProps {
  user?: any;
}

const Navigation = ({ user }: NavigationProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <nav className="bg-card border-b border-border shadow-[var(--shadow-vintage)] sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl font-bold text-foreground">
              Paws & Whiskers
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#animals" className="text-foreground hover:text-primary transition-colors">
              Animals
            </a>
            <a href="#products" className="text-foreground hover:text-primary transition-colors">
              Products
            </a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors">
              Services
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
