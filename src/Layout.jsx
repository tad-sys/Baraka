import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext'; 
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  LayoutDashboard, 
  Search, 
  LogOut, 
  Heart, 
  Sun, 
  Moon, 
  LogIn, 
  User, 
  Settings as SettingsIcon, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // CHANGEMENT ICI : On utilise l'email en dur pour éviter les bugs de chargement de profil
  const isAdmin = user?.email === "sourcedusavoir7@gmail.com";

  // --- LOGIQUE NOTIFICATIONS ---
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadDonations = async () => {
      try {
        const { data: myLists } = await supabase
          .from('DonationList')
          .select('id')
          .eq('created_by', user.email);

        if (myLists && myLists.length > 0) {
          const listIds = myLists.map(l => l.id);

          // Requête simplifiée pour éviter les timeouts
          const { count, error } = await supabase
            .from('DonationProof')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

          if (!error) setUnreadCount(count || 0);
        }
      } catch (err) {
        console.error("Erreur notifications:", err);
      }
    };

    fetchUnreadDonations();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'DonationProof' }, 
        () => fetchUnreadDonations()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // --- LOGIQUE DARK MODE ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      {/* --- BARRE DE NAVIGATION --- */}
      <nav className="border-b sticky top-0 z-50 p-4 flex justify-between items-center bg-card/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm shadow-primary/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-primary tracking-tight">Baraka</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {/* Bouton Admin Direct basé sur l'email */}
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden lg:flex rounded-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 gap-2 px-4 h-9 shadow-sm shadow-amber-200/50">
              <Link to="/AdminModeration">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold text-[10px] uppercase tracking-wider">Modération</span>
              </Link>
            </Button>
          )}

          <Button onClick={toggleTheme} variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </Button>

          <Button asChild variant="ghost" size="sm" className="hidden sm:flex rounded-full mr-2">
            <Link to="/Explore">
              <Search className="w-4 h-4 mr-2" />
              Explorer
            </Link>
          </Button>

          {user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all border border-primary/10">
                    <User className="h-5 w-5 text-primary" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-64 mt-2 rounded-[1.5rem] p-2 shadow-2xl border-primary/5" align="end">
                  <DropdownMenuLabel className="font-normal px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-foreground">Mon profil</p>
                      <p className="text-xs leading-none text-muted-foreground truncate opacity-70">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/5" />
                  
                  {/* Lien Admin dans le menu */}
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-amber-50 focus:text-amber-700">
                      <Link to="/AdminModeration" className="flex items-center w-full font-bold">
                        <ShieldCheck className="mr-3 h-4 w-4 text-amber-600" />
                        <span>Espace Modération</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-primary/5">
                    <Link to="/MyLists" className="flex items-center w-full">
                      <LayoutDashboard className="mr-3 h-4 w-4 text-primary/70" />
                      <span className="flex-1">Mes Listes</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-destructive/10 text-destructive text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-primary/5">
                    <Link to="/Settings" className="flex items-center w-full">
                      <SettingsIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-primary/5" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="rounded-xl cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive font-medium"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Link to="/Auth" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-semibold">Connexion</span>
              </Link>
            </Button>
          )}
        </div>
      </nav>

      <main className="flex-1 relative">
        {children}
      </main>

      <footer className="bg-card border-t pt-16 pb-8 px-6 mt-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">Baraka</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Faciliter la générosité et l'entraide communautaire.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/About" className="hover:text-primary transition-colors">À propos</Link></li>
              <li><Link to="/Explore" className="hover:text-primary transition-colors">Explorer</Link></li>
              <li><Link to="/MyLists" className="hover:text-primary transition-colors">Mes projets</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Aide</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/About" className="hover:text-primary transition-colors">Comment ça marche ?</Link></li>
              <li className="hover:text-primary cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>

          <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
            <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 fill-primary" />
              Faire un don
            </h4>
            <Button asChild size="sm" className="w-full rounded-xl text-xs mt-2">
              <Link to="/Explore">Voir les causes</Link>
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t flex flex-col sm:row justify-between items-center gap-4 text-[11px] text-muted-foreground uppercase tracking-wider">
          <p>© 2026 Baraka — Développé pour le bien commun</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Confidentialité</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Mentions légales</span>
          </div>
        </div>
      </footer>
    </div>
  );
}