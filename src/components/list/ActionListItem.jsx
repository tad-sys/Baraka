import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, Trash2, Star, StarOff, Heart, Plus, Minus, 
  Lock, Target, TrendingUp, CheckCircle2, PartyPopper, Flag, ExternalLink 
} from 'lucide-react';
import CategoryIcon, { getCategoryLabel } from '../shared/CategoryIcon';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import DonationModal from '../shared/DonationModal';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

export default function ActionListItem({ 
  action, 
  isOwner, 
  onEdit, 
  onDelete, 
  onToggleFeatured, 
  onUpdateQuantity,
  onActionSuccess,
  listRequireAuth 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // --- CALCULS DE PROGRESSION ---
  const totalWanted = parseFloat(action.goal_amount || 0);
  const totalCurrent = parseFloat(action.amount || 0);
  const progress = totalWanted > 0 ? (totalCurrent / totalWanted) * 100 : 0;
  const isCompleted = progress >= 100;

  // --- LOGIQUE DE SIGNALEMENT ---
  const handleReport = async () => {
    if (isOwner || isReporting) return;
    const confirmReport = window.confirm("Souhaitez-vous signaler cette action pour contenu inapproprié ?");
    if (!confirmReport) return;

    setIsReporting(true);
    try {
      const { data: currentAction, error: fetchError } = await supabase
        .from('DonationAction')
        .select('flag_count')
        .eq('id', action.id)
        .single();

      if (fetchError) throw fetchError;
        
      const { error: updateError } = await supabase
        .from('DonationAction')
        .update({ flag_count: (currentAction?.flag_count || 0) + 1 })
        .eq('id', action.id);

      if (updateError) throw updateError;
      toast.success("Signalement envoyé. Merci de votre vigilance.");
    } catch (err) {
      toast.error("Impossible d'envoyer le signalement.");
    } finally {
      setIsReporting(false);
    }
  };

  const handleDonationClick = () => {
    if (listRequireAuth === true && !user) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/auth?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleQuantityUpdate = async (newQty) => {
    if (onUpdateQuantity) {
      const safeQty = Math.max(0, newQty);
      const newAmount = safeQty * (parseFloat(action.unit_price) || 0);
      try {
        await onUpdateQuantity(action, safeQty, newAmount);
        if (onActionSuccess) onActionSuccess();
      } catch (err) {
        toast.error("Erreur lors de la mise à jour.");
      }
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`group p-4 sm:p-5 border transition-all duration-300 rounded-[2rem] relative overflow-hidden ${
        isCompleted 
          ? 'border-green-200 bg-green-50/40 shadow-sm' 
          : 'hover:shadow-md border-border bg-card'
      }`}>
        
        {!isOwner && (
          <button 
            onClick={handleReport}
            disabled={isReporting}
            className={`absolute top-4 left-4 z-10 p-2 rounded-full bg-white/80 border shadow-sm hover:text-red-600 transition-all sm:opacity-0 sm:group-hover:opacity-100 ${isReporting ? 'opacity-100 text-red-600' : ''}`}
          >
            <Flag className={`w-3.5 h-3.5 ${isReporting ? 'animate-pulse' : ''}`} />
          </button>
        )}

        <div className="flex gap-4">
          <div className={`hidden sm:flex w-20 h-20 rounded-[1.5rem] items-center justify-center flex-shrink-0 transition-all duration-500 overflow-hidden ${
            isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-primary/5 text-primary/60'
          }`}>
            {action.image_url ? (
              <img src={action.image_url} alt={action.title} className="w-full h-full object-cover" />
            ) : (
              isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <CategoryIcon category={action.category} size="lg" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-bold text-lg tracking-tight ${isCompleted ? 'text-green-800' : 'text-foreground'}`}>
                    {action.title}
                  </h3>
                  {isCompleted && (
                    <Badge className="bg-green-600 text-white border-none text-[10px] font-black animate-in fade-in zoom-in">
                      <PartyPopper className="w-3 h-3 mr-1" /> Terminé !
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0 bg-background/50">
                    <CategoryIcon category={action.category} size="xs" className="mr-1" />
                    {getCategoryLabel(action.category)}
                  </Badge>
                  {action.association_name && (
                    <span className="text-xs text-muted-foreground font-medium italic">via {action.association_name}</span>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="flex items-center gap-0.5 bg-muted/30 p-1 rounded-full">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:text-amber-600" onClick={() => onToggleFeatured(action)}>
                    {action.is_featured ? <StarOff className="w-4 h-4 fill-amber-500 text-amber-500" /> : <Star className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:text-primary" onClick={() => onEdit(action)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:text-destructive" onClick={() => onDelete(action)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {action.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {action.description}
              </p>
            )}

            {/* --- NOUVEAU : VÉRIFICATEUR DE LIEN POUR LE PROPRIÉTAIRE --- */}
            {isOwner && action.payment_link && (
              <div className="mt-3 p-3 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-left-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest mb-0.5">Lien de l'association</p>
                  <p className="text-[11px] truncate font-mono text-muted-foreground">{action.payment_link}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 rounded-xl text-[10px] font-bold"
                  onClick={() => window.open(action.payment_link, '_blank')}
                >
                  Vérifier <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
              </div>
            )}

            {/* Widgets de Stats */}
            <div className={`flex items-center gap-4 mt-4 p-3 rounded-2xl border ${
              isCompleted ? 'bg-white/60 border-green-100' : 'bg-muted/30 border-transparent'
            }`}>
              <div className="flex-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Progression</p>
                <div className="flex items-end gap-2">
                  <span className={`text-lg font-black leading-none ${isCompleted ? 'text-green-600' : 'text-foreground'}`}>
                    {formatPrice(totalCurrent)}
                  </span>
                  <span className="text-xs text-muted-foreground mb-0.5 font-medium">sur {formatPrice(totalWanted)}</span>
                </div>
              </div>
              <div className="text-right">
                 <span className={`text-xs font-black px-2 py-1 rounded-lg ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
              />
            </div>

            <div className="flex items-center justify-between mt-5">
              <div className="text-[11px] font-medium text-muted-foreground italic">
                {isCompleted ? "Action financée !" : `${action.current_quantity || 0} / ${action.goal_quantity} collectés`}
              </div>

              {isOwner ? (
                <div className="flex items-center gap-2 border bg-white rounded-full p-1 shadow-sm">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                    onClick={() => handleQuantityUpdate((action.current_quantity || 0) - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-xs font-black w-6 text-center">{action.current_quantity || 0}</span>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 rounded-full"
                    onClick={() => handleQuantityUpdate((action.current_quantity || 0) + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleDonationClick}
                  className={`rounded-full px-5 h-9 font-bold transition-all active:scale-95 ${
                    isCompleted 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-primary hover:bg-primary/90 shadow-md shadow-primary/20'
                  }`}
                >
                  { (listRequireAuth === true && !user) ? <Lock className="w-3.5 h-3.5 mr-2" /> : <Heart className="w-3.5 h-3.5 mr-2 fill-current" /> }
                  {isCompleted ? "Donner plus" : "Participer"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <DialogTitle className="sr-only">Soutenir {action.title}</DialogTitle>
          <DonationModal 
            action={action} 
            onClose={() => setIsModalOpen(false)} 
            onRefresh={onActionSuccess} 
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}