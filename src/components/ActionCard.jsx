import React, { useState } from 'react';
import { TreePine, Droplets, Utensils, Home as HomeIcon, Building2, GraduationCap, Heart, Gift, Package, ExternalLink, PlusCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import DonationModal from './shared/DonationModal';
import { supabase } from '@/api/supabaseClient';

export const categoryConfig = {
  arbre: { label: 'Arbre', icon: TreePine, color: 'bg-green-50 text-green-600 border-green-200' },
  repas: { label: 'Repas', icon: Utensils, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  puits: { label: 'Puits', icon: Droplets, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  maison: { label: 'Maison', icon: HomeIcon, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  mosquee: { label: 'Mosquée', icon: Building2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ecole: { label: 'École', icon: GraduationCap, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  orphelin: { label: 'Orphelins', icon: Heart, color: 'bg-pink-50 text-pink-600 border-pink-200' },
  mariage: { label: 'Mariage', icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-200' },
  cadeau: { label: 'Cadeau', icon: Gift, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  autre: { label: 'Autre', icon: Package, color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

export default function ActionCard({ action, list, showProgress = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  
  const config = categoryConfig[action.category] || categoryConfig.autre;
  const Icon = config.icon;
  
  const currentAmount = action.amount || 0;
  const goalAmount = action.goal_amount || 0;
  const currentQty = action.current_quantity || 0;
  const goalQty = action.goal_quantity || 0;

  const progress = goalAmount > 0 
    ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) 
    : 0;

  // --- LOGIQUE DE SIGNALEMENT ---
  const handleReport = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (reporting) return;

    const confirmReport = window.confirm(
      "Souhaitez-vous signaler cette action ?\n\nCela aidera nos modérateurs à vérifier si le contenu respecte nos conditions d'utilisation."
    );
    
    if (confirmReport) {
      setReporting(true);
      try {
        // Mise à jour du flag et incrémentation du compteur
        const { error } = await supabase
          .from('DonationAction')
          .update({ 
            is_flagged: true,
            flag_count: (action.flag_count || 0) + 1 
          })
          .eq('id', action.id);

        if (error) throw error;
        alert("Merci. Le contenu a été signalé pour examen.");
      } catch (err) {
        console.error("Erreur signalement:", err);
        alert("Une erreur est survenue lors du signalement.");
      } finally {
        setReporting(false);
      }
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative">
      
      {/* BOUTON SIGNALER (Discret) */}
      <button 
        onClick={handleReport}
        disabled={reporting}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-red-500/80 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        title="Signaler un contenu inapproprié"
      >
        {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
      </button>

      {/* Image ou Placeholder */}
      <div className="h-44 overflow-hidden shrink-0 bg-muted/30 relative">
        {action.image_url ? (
          <img 
            src={action.image_url} 
            alt={action.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Icon className="w-12 h-12 opacity-20 text-foreground" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${config.color}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
          {action.unit_price > 0 && (
            <span className="text-sm font-bold text-primary shrink-0">
              {action.unit_price}€ <span className="text-[10px] font-normal text-muted-foreground">/ unité</span>
            </span>
          )}
        </div>

        <h3 className="font-bold text-foreground mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {action.title}
        </h3>

        {action.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {action.description}
          </p>
        )}

        <div className="mt-auto space-y-4">
          {showProgress && goalQty > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">
                  {currentQty} sur {goalQty} {config.label.toLowerCase()}(s)
                </span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/40">
            {list ? (
              <Link 
                to={`/ListDetail?id=${list.id}`} 
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors truncate flex items-center gap-1 max-w-[120px]"
              >
                <span className="opacity-70 text-base">📋</span> {list.title}
              </Link>
            ) : <div />}

            {action.payment_link && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                size="sm" 
                className="rounded-full px-5 font-bold shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90 text-white"
              >
                Soutenir <Heart className="w-3 h-3 ml-2 fill-current" />
              </Button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/20 text-center">
            <p className="text-[10px] text-muted-foreground mb-2">
              Vous aussi, créez votre liste de dons personnalisée
            </p>
            <Button asChild variant="ghost" size="sm" className="w-full rounded-xl text-primary hover:bg-primary/5 text-[11px] h-8">
              <Link to="/CreateList" className="flex items-center justify-center gap-2">
                <PlusCircle className="w-3.5 h-3.5" />
                Créer ma liste Baraka
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* MODALE DE DON */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-3xl border-none">
          <DialogTitle className="sr-only">Faire un don pour {action.title}</DialogTitle>
          <DonationModal 
            action={action} 
            onClose={() => setIsModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}