import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, Calendar, Loader2, Heart, ChevronDown, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 6;

const typeLabels = {
  mariage: '💍 Mariage',
  association: '🤲 Association',
  naissance: '👶 Naissance',
  aqiqa: '🐑 Aqiqa',
  autre: '✨ Autre',
};

export default function Explore() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLists([]);
    setPage(0);
    setHasMore(true);
    fetchPublicLists(0, true);
  }, [selectedType]);

  const fetchPublicLists = async (pageIndex, isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      else setIsFetchingMore(true);

      const from = pageIndex * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // REQUÊTE FILTRÉE PAR MODÉRATION
      let query = supabase
        .from('DonationList')
        .select('*', { count: 'exact' })
        .eq('is_public', true)
        .eq('moderation_status', 'active') // Ne montre que les listes validées
        .lt('flag_count', 5)               // Cache si la liste a reçu 5 signalements ou plus
        .order('created_at', { ascending: false })
        .range(from, to);

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (isInitial) {
        setLists(data || []);
      } else {
        setLists(prev => [...prev, ...(data || [])]);
      }

      setHasMore(lists.length + (data?.length || 0) < count);
    } catch (error) {
      console.error("Erreur Explore:", error.message);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPublicLists(nextPage);
  };

  const filtered = lists.filter((l) =>
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-background py-12 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* HERO & FILTERS */}
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>Découvrez les initiatives de la communauté</span>
          </motion.div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Explorer Baraka</h1>
          
          <div className="max-w-2xl mx-auto mt-10 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre ou description..."
                className="pl-12 h-14 rounded-2xl border-none shadow-xl shadow-black/[0.03] bg-card text-lg"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <Button variant={selectedType === 'all' ? 'default' : 'outline'} onClick={() => setSelectedType('all')} className="rounded-full h-9 text-xs transition-all">Tout</Button>
              {Object.entries(typeLabels).map(([key, label]) => (
                <Button key={key} variant={selectedType === key ? 'default' : 'outline'} onClick={() => setSelectedType(key)} className="rounded-full h-9 text-xs bg-card transition-all">
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => <div key={i} className="h-80 rounded-[2.5rem] bg-card animate-pulse border border-border/50" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filtered.map((list) => {
                  const progress = Math.min(((list.current_amount || 0) / (list.target_amount || 1)) * 100, 100);
                  
                  return (
                    <motion.div 
                      key={list.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden h-full flex flex-col group hover:shadow-2xl transition-all duration-500 border-none bg-card rounded-[2.5rem] shadow-sm">
                        <div className="h-48 relative overflow-hidden">
                          {list.cover_image ? (
                            <img src={list.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-primary/5 flex items-center justify-center text-6xl opacity-50 group-hover:opacity-100 transition-opacity">
                              {typeLabels[list.type]?.split(' ')[0]}
                            </div>
                          )}
                          <Badge className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-black/80 backdrop-blur-md text-foreground border-none rounded-full px-3 py-1">
                            {typeLabels[list.type]}
                          </Badge>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-display text-xl font-bold mb-2 line-clamp-1">{list.title}</h3>
                          
                          <div className="mb-6 space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-primary">{list.current_amount || 0}€ récoltés</span>
                              <span className="text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: `${progress}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium italic px-1">
                              <Users className="w-3 h-3" />
                              {list.contributor_count || 0} donateurs soutiennent ce projet
                            </p>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">{list.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-5 border-t border-border/40">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              {list.target_date ? format(new Date(list.target_date), 'dd MMM yyyy', { locale: fr }) : 'Permanent'}
                            </span>
                            <Link to={`/ListDetail?id=${list.id}`}>
                              <Button className="rounded-2xl px-6 shadow-lg shadow-primary/20 active:scale-95 transition-all">Soutenir</Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && (
              <div className="mt-16 text-center">
                <Button 
                  onClick={loadMore} 
                  disabled={isFetchingMore}
                  variant="ghost" 
                  className="rounded-2xl h-14 px-10 text-primary hover:bg-primary/5 transition-all gap-2 font-bold"
                >
                  {isFetchingMore ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Voir plus de causes
                      <ChevronDown className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}