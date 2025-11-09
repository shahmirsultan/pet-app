import { PawPrint } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold">Paws & Whiskers</span>
            </div>
            <p className="text-muted-foreground">
              Your trusted vintage pet store since 1950. Providing quality pets, premium supplies, 
              and professional care with old-fashioned values and modern expertise.
            </p>
          </div>

          <div>
            <h3 className="font-serif font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#animals" className="hover:text-primary transition-colors">Animals</a></li>
              <li><a href="#products" className="hover:text-primary transition-colors">Products</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold mb-4">Information</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Paws & Whiskers Pet Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
