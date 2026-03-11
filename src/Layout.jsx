import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { Leaf, Plus, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogin = () => {
    setMenuOpen(false);
    // Plus de bidouillage d'URL : on laisse base44 gérer la racine
    base44.auth.redirectToLogin();
  };

  const handleLogout = () => {
    base44.auth.logout().then(() => {
      window.location.href = "/";
    });
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-foreground">Baraka</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl('Home')} className={`text-sm font-medium transition-colors hover:text-primary ${currentPageName === 'Home' ? 'text-primary' : 'text-muted-foreground'}`}>
              Accueil
            </Link>
            {user && (
              <Link to={createPageUrl('MyLists')} className={`text-sm font-medium transition-colors hover:text-primary ${currentPageName === 'MyLists' ? 'text-primary' : 'text-muted-foreground'}`}>
                Mes Listes
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
                  <Link to={createPageUrl('CreateList')}>
                    <Plus className="w-4 h-4 mr-1.5" /> Créer une liste
                  </Link>
                </Button>
                <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Button size="sm" onClick={handleLogin} className="rounded-xl">
                Connexion
              </Button>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-1">
            <Link to={createPageUrl('Home')} onClick={() => setMenuOpen(false)} className="block text-sm font-medium py-2 px-2 rounded-lg hover:bg-muted">Accueil</Link>
            {user && <Link to={createPageUrl('MyLists')} onClick={() => setMenuOpen(false)} className="block text-sm font-medium py-2 px-2 rounded-lg hover:bg-muted">Mes Listes</Link>}
            {user ? (
              <>
                <Link to={createPageUrl('CreateList')} onClick={() => setMenuOpen(false)} className="block text-sm font-medium py-2 px-2 rounded-lg text-primary">+ Créer une liste</Link>
                <button onClick={handleLogout} className="block w-full text-left text-sm font-medium py-2 px-2 rounded-lg text-destructive hover:bg-destructive/10">Se déconnecter</button>
              </>
            ) : (
              <button onClick={handleLogin} className="block w-full text-left text-sm font-medium py-2 px-2 rounded-lg text-primary">Connexion</button>
            )}
          </div>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}