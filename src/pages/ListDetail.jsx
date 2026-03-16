import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext'; 
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Gift, Share2, Settings2, Check, Target, PartyPopper, Lock } from 'lucide-react';
import { createPageUrl, formatPrice } from '@/lib/utils'; 
import ActionListItem from '@/components/list/ActionListItem';
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from 'framer-motion';

export default function ListDetail() {
  const [searchParams] = useSearchParams();
  const listId = searchParams.get('id');
  const { user } = useAuth(); 
  
  const [list, setList] = useState(null);
  const [actions, setActions] = useState([]);
  const [totalRaised, setTotalRaised] = useState(0); 
  const [calculatedGoal, setCalculatedGoal] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const isOwner = user && list && (user.email === list.created_by);

  useEffect(() => {
    if (listId) {
      fetchPublicListData();
    }
  }, [listId]);

  const fetchPublicListData = async () => {
    if (!list) setLoading(true); 
    
    try {
      // 1. Récupération des infos de la liste avec filtre de modération
      const { data: listData, error: listError } = await supabase
        .from('DonationList')
        .select('*')
        .eq('id', listId)
        .eq('moderation_status', 'active') // Filtre de modération
        .single();

      if (listError || (listData && listData.flag_count >= 5)) {
        setErrorStatus("not_found");
        throw new Error("Liste introuvable ou signalée.");
      }
      setList(listData);

      // 2. Récupération des actions/objets avec filtre de modération
      const { data: actionsData, error: actionsError } = await supabase
        .from('DonationAction')
        .select('*')
        .eq('list_id', listId)
        .eq('moderation_status', 'active') // Filtre de modération
        .lt('flag_count', 5)               // Filtre de modération (seuil de signalement)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (actionsError) throw actionsError;
      const currentActions = actionsData || [];
      setActions(currentActions);

      // --- CALCULS SYNCHRONISÉS ---
      const totalRelaisedCalc = currentActions.reduce((sum, item) => {
        return sum + (Number(item.current_quantity) || 0) * (Number(item.unit_price) || 0);
      }, 0);

      const totalGoalCalc = currentActions.reduce((sum, item) => {
        return sum + (Number(item.goal_quantity) || 0) * (Number(item.unit_price) || 0);
      }, 0);
      
      setTotalRaised(totalRelaisedCalc);
      setCalculatedGoal(totalGoalCalc);

    } catch (error) {
      console.error("Erreur de mise à jour:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = createPageUrl('ListDetail', { id: listId });
    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.title || 'Baraka',
          text: `Découvrez cette liste de dons : ${list?.title}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Erreur partage:", err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const progressPercentage = calculatedGoal > 0 ? Math.min((totalRaised / calculatedGoal) * 100, 100) : 0;
  const isGoalReached = progressPercentage >= 100;
  const totalItemsDonated = actions.reduce((sum, a) => sum + (Number(a.current_quantity) || 0), 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-12 w-1/3 mx-auto" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (errorStatus === "not_found" || !list) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Liste introuvable</h2>
        <p className="text-muted-foreground mb-8">Cette liste n'existe pas ou n'est plus disponible.</p>
        <Button asChild>
          <Link to="/Explore text-white">Retourner à l'exploration</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Link>
        {isOwner && (
          <Button asChild variant="outline" size="sm" className="rounded-xl border-primary/30">
            <Link to={`/ManageList?id=${list.id}`}>
              <Settings2 className="w-4 h-4 mr-2" /> Paramètres
            </Link>
          </Button>
        )}
      </div>

      <header className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isGoalReached ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}
        >
          {isGoalReached ? <PartyPopper size={40} /> : <Heart size={40} fill="currentColor" />}
        </motion.div>
        <h1 className="text-4xl font-bold mb-4">{list.title}</h1>
        <p className="text-muted-foreground italic">"{list.description}"</p>
        
        {list.require_auth && (
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 py-1 px-3">
              <Lock className="w-3 h-3 mr-2" /> Connexion requise pour participer
            </Badge>
          </div>
        )}
      </header>

      {/* CARD DE PROGRESSION GLOBALE */}
      {calculatedGoal > 0 && (
        <Card className={`mb-12 p-8 rounded-[2.5rem] shadow-xl border-primary/10 relative overflow-hidden transition-all duration-500 ${isGoalReached ? 'bg-green-50/50 border-green-200' : 'bg-white'}`}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 font-bold mb-1 text-xs uppercase tracking-widest text-primary">
                <Target className="w-4 h-4" /> Progression globale
              </div>
              <p className="text-3xl font-black">
                {formatPrice(totalRaised)} <span className="text-sm font-medium text-muted-foreground">/ {formatPrice(calculatedGoal)}</span>
              </p>
            </div>
            <div className="text-right">
              <span className={`text-4xl font-black ${isGoalReached ? 'text-green-600' : 'text-primary'}`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          <Progress value={progressPercentage} className="h-4" />
          
          <div className="mt-4 flex justify-between items-center text-xs font-bold text-muted-foreground uppercase">
            <span>{totalItemsDonated} articles déjà offerts</span>
            {isGoalReached && <span className="text-green-600">Objectif atteint !</span>}
          </div>
        </Card>
      )}

      {/* LISTE DES ARTICLES */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gift className="text-primary" /> Articles ({actions.length})
          </h2>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Share2 className="w-4 h-4 mr-2" />} 
            {copied ? "Copié !" : "Partager"}
          </Button>
        </div>

        <div className="grid gap-4">
          {actions.map(action => (
            <ActionListItem 
              key={action.id} 
              action={action} 
              isOwner={isOwner}
              listRequireAuth={list?.require_auth}
              onActionSuccess={fetchPublicListData}
            />
          ))}
        </div>
      </div>
    </div>
  );
}