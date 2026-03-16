import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Globe, Lock, Target, Flag } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

const typeConfig = {
  mariage: { label: 'Mariage', emoji: '💍', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  association: { label: 'Association', emoji: '🤲', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  naissance: { label: 'Naissance', emoji: '👶', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  aqiqa: { label: 'Aqiqa', emoji: '🐑', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  autre: { label: 'Autre', emoji: '✨', color: 'bg-purple-50 text-purple-600 border-purple-100' },
};

export default function ListCard({ list, actionsCount = 0, isOwner = false, actions = [] }) {
  const [isReporting, setIsReporting] = useState(false);
  const config = typeConfig[list.type] || typeConfig.autre;

  // CALCUL DE LA PROGRESSION GLOBALE DE LA LISTE
  const totalGoal = actions?.reduce((acc, curr) => acc + (parseFloat(curr.goal_amount) || 0), 0) || 0;
  const totalCurrent = actions?.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0) || 0;
  const globalProgress = totalGoal > 0 ? Math.min(100, Math.round((totalCurrent / totalGoal) * 100)) : 0;

  // FONCTION DE SIGNALEMENT
  const handleReport = async (e) => {
    e.preventDefault();
    if (isOwner) return;

    const confirmReport = window.confirm("Souhaitez-vous signaler cette liste pour contenu inapproprié ?");
    if (!confirmReport) return;

    setIsReporting(true);
    try {
      const { error } = await supabase.rpc('increment_list_flag', { row_id: list.id });
      
      if (error) {
        const { data } = await supabase
          .from('DonationList')
          .select('flag_count')
          .eq('id', list.id)
          .single();
          
        await supabase
          .from('DonationList')
          .update({ flag_count: (data?.flag_count || 0) + 1 })
          .eq('id', list.id);
      }

      toast.success("Signalement pris en compte.");
    } catch (err) {
      console.error(err);
      toast.error("Échec du signalement.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full shadow-sm relative">
      
      {/* Bouton Signalement */}
      {!isOwner && (
        <button 
          onClick={handleReport}
          disabled={isReporting}
          className="absolute top-3 left-3 z-30 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-red-500 hover:text-white transition-all duration-300 text-white opacity-0 group-hover:opacity-100"
          title="Signaler"
        >
          <Flag className={`w-3.5 h-3.5 ${isReporting ? 'animate-pulse' : ''}`} />
        </button>
      )}

      {/* Image ou Placeholder */}
      <div className="h-40 overflow-hidden relative shrink-0">
        {list.cover_image ? (
          <img 
            src={list.cover_image} 
            alt={list.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/30 flex items-center justify-center">
            <span className="text-6xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500">
              {config.emoji}
            </span>
          </div>
        )}
        
        {isOwner && (
          <div className="absolute top-3 right-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
              list.is_public 
                ? 'bg-white/80 text-primary border-primary/20' 
                : 'bg-black/60 text-white border-white/20'
            }`}>
              {list.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {list.is_public ? 'Public' : 'Privé'}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${config.color}`}>
            {config.label}
          </span>
          {list.target_date && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(list.target_date), 'd MMM yyyy', { locale: fr })}
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors italic leading-tight">
          {list.title}
        </h3>
        
        {list.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {list.description}
          </p>
        )}

        {/* PROGRESSION GLOBALE */}
        {actionsCount > 0 && (
          <div className="mb-5 p-3 bg-muted/30 rounded-2xl border border-border/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                <Target className="w-3 h-3 text-primary" /> Objectif Global
              </div>
              <span className="text-[10px] font-black text-primary">{globalProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-tighter">
            {actionsCount} {actionsCount > 1 ? 'actions' : 'action'}
          </span>
          
          <div className="flex gap-2">
            {isOwner && (
              <Button asChild variant="ghost" size="sm" className="rounded-full h-8 px-3 hover:bg-muted font-bold text-xs">
                <Link to={`/ManageList?id=${list.id}`}>Gérer</Link>
              </Button>
            )}
            <Button asChild size="sm" className="rounded-full h-8 px-4 font-bold shadow-sm">
              <Link to={`/ListDetail?id=${list.id}`}>
                Voir <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}