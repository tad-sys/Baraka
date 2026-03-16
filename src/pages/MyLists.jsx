import { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient'; 
import { Link } from 'react-router-dom';
// CORRECTION : Importation depuis le bon chemin (src/lib/utils)
import { createPageUrl } from '@/lib/utils';
import ListCard from '../components/ListCard';
import { Button } from '@/components/ui/button';
import { Plus, List as ListIcon, Settings2, Globe, Lock, Eye } from 'lucide-react';

export default function MyLists() {
  const [lists, setLists] = useState([]);
  const [actionsCounts, setActionsCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyLists();
  }, []);

  const fetchMyLists = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: myLists, error: listError } = await supabase
        .from('DonationList')
        .select('*')
        .eq('created_by', user.email)
        .order('created_at', { ascending: false });

      if (listError) throw listError;
      setLists(myLists || []);

      const listIds = (myLists || []).map(l => l.id);
      if (listIds.length > 0) {
        const { data: allActions, error: actionsError } = await supabase
          .from('DonationAction')
          .select('list_id')
          .in('list_id', listIds);

        if (!actionsError && allActions) {
          const counts = {};
          allActions.forEach(a => {
            counts[a.list_id] = (counts[a.list_id] || 0) + 1;
          });
          setActionsCounts(counts);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des listes:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 min-h-[80vh]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">Mes Listes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Gérez vos collectes et suivez l'avancement de vos projets.</p>
        </div>
        <Button asChild size="lg" className="rounded-2xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Link to={createPageUrl('CreateList')}>
            <Plus className="w-5 h-5 mr-2" /> Nouvelle liste
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[350px] rounded-[2.5rem] bg-muted/50 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : lists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {lists.map(list => (
            <div key={list.id} className="group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                {/* Badge de visibilité */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border text-[10px] font-bold uppercase tracking-wider ${
                    list.is_public 
                      ? 'bg-white/80 border-primary/20 text-primary' 
                      : 'bg-gray-100/80 border-gray-200 text-gray-500'
                  }`}>
                    {list.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {list.is_public ? 'Publique' : 'Privée'}
                  </div>
                </div>

                <ListCard 
                  list={list} 
                  actionsCount={actionsCounts[list.id] || 0} 
                  isOwner 
                />
              </div>
              
              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button asChild variant="outline" className="rounded-2xl border-primary/10 hover:bg-primary hover:text-white hover:border-primary transition-all gap-2 h-11">
                  <Link to={`/ManageList?id=${list.id}`}>
                    <Settings2 className="w-4 h-4" />
                    Gérer
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all gap-2 h-11">
                  <Link to={`/ListDetail?id=${list.id}`}>
                    <Eye className="w-4 h-4" />
                    Voir
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed border-border/40 rounded-[3rem] bg-muted/5 animate-in zoom-in duration-700">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ListIcon className="w-12 h-12 text-primary/30" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">Prêt à semer le bien ?</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-lg leading-relaxed">
            Vous n'avez pas encore créé de liste. Transformez vos intentions en actions concrètes dès maintenant.
          </p>
          <Button asChild size="lg" className="rounded-[2rem] px-10 h-14 text-base shadow-2xl shadow-primary/20">
            <Link to={createPageUrl('CreateList')}>Créer ma première liste Baraka</Link>
          </Button>
        </div>
      )}
    </div>
  );
}