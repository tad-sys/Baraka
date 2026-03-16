import { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Sparkles, Heart, Globe, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import ActionCard from '../components/ActionCard'; 
import ListCard from '../components/ListCard';

export default function Home() {
  const [featuredActions, setFeaturedActions] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // ACTIONS EN VEDETTE : Filtrées par modération
      const { data: actions } = await supabase
        .from('DonationAction')
        .select('*')
        .eq('is_featured', true)
        .eq('moderation_status', 'active') // Uniquement les actions validées
        .lt('flag_count', 5)               // Cacher si trop de signalements
        .limit(3);

      // LISTES RÉCENTES : Filtrées par modération
      const { data: allLists } = await supabase
        .from('DonationList')
        .select('*')
        .eq('is_public', true)
        .eq('moderation_status', 'active') // Uniquement les listes validées
        .lt('flag_count', 5)               // Cacher si trop de signalements
        .order('created_at', { ascending: false })
        .limit(6);

      setFeaturedActions(actions || []);
      setLists(allLists || []);
    } catch (error) {
      console.error("Erreur Home:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToActions = () => {
    const element = document.getElementById('actions-vedette');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getList = (listId) => lists.find(l => l.id === listId);

  return (
    <div className="bg-background text-foreground">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-primary/5 via-accent/20 to-secondary/30 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-primary mb-6 border border-primary/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Chaque geste est une graine pour l'avenir.
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Créez votre liste<br />
              <span className="text-primary italic">de dons solidaires</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Simplifiez la générosité. Mariages, projets caritatifs ou événements de vie : centralisez vos besoins et permettez à vos proches de contribuer concrètement.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="lg" className="rounded-2xl bg-primary hover:bg-primary/90 px-10 h-14 shadow-xl shadow-primary/20">
                <Link to="/CreateList">
                  <Leaf className="w-5 h-5 mr-2" />
                  Créer ma liste
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-2xl px-10 h-14 bg-white/50 backdrop-blur-sm"
                onClick={scrollToActions}
              >
                Explorer les actions
              </Button>
            </div>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: '🌱', label: 'Projets durables', desc: 'Puits, arbres, repas' },
              { icon: '🎁', label: 'Listes cadeaux', desc: 'Mariages, Naissances' },
              { icon: '📈', label: 'Suivi réel', desc: 'Objectifs transparents' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-border/40 text-center shadow-sm">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-foreground">{item.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ACTIONS */}
      <section id="actions-vedette" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">Actions en vedette</h2>
            <p className="text-muted-foreground mt-2 text-lg">Le top des causes du moment</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-primary/40">
            <Globe className="w-10 h-10" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
          </div>
        ) : featuredActions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredActions.map(action => (
              <motion.div key={action.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <ActionCard action={action} list={getList(action.list_id)} showProgress />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-border/60 rounded-[2rem] bg-muted/5">
            <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Pas encore d'actions en vedette.</p>
            <Button asChild variant="link" className="mt-2 text-primary">
              <Link to="/CreateList">Soyez le premier à créer une liste</Link>
            </Button>
          </div>
        )}
      </section>

      {/* RECENT LISTS */}
      {lists.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">Listes récentes</h2>
            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/Explore">Tout voir <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {lists.map(list => (
              <motion.div key={list.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ListCard list={list} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-primary p-12 md:p-20 text-center text-primary-foreground shadow-2xl shadow-primary/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          </div>
          
          <h2 className="font-display text-4xl font-bold mb-6 relative">Prêt à semer le bien ?</h2>
          <p className="text-primary-foreground/90 text-lg mb-10 max-w-lg mx-auto relative">
            Rejoignez Baraka et donnez vie à vos projets solidaires. Simple, transparent et impactant.
          </p>
          <Button asChild size="lg" className="rounded-2xl bg-white text-primary hover:bg-white/90 px-12 h-14 text-lg font-bold shadow-lg">
            <Link to="/CreateList">Démarrer maintenant</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}