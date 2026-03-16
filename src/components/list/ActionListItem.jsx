import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pencil, Trash2, Star, StarOff, Heart, Plus, Minus, 
  Lock, Target, TrendingUp, CheckCircle2, PartyPopper, Flag 
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

  // CALCULS BASÉS SUR LE MONTANT RÉEL
  const totalWanted = parseFloat(action.goal_amount || 0);
  const totalCurrent = parseFloat(action.amount || 0);

  const progress = totalWanted > 0
    ? (totalCurrent / totalWanted) * 100
    : 0;

  const isCompleted = progress >= 100;

  // FONCTION DE SIGNALEMENT
  const handleReport = async () => {
    if (isOwner) return;

    const confirmReport = window.confirm("Souhaitez-vous signaler cet article pour contenu inapproprié ?");
    if (!confirmReport) return;

    setIsReporting(true);
    try {
      // Appel RPC ou mise à jour directe du compteur
      const { data: currentData } = await supabase
        .from('DonationAction')
        .select('flag_count')
        .eq('id', action.id)
        .single();
        
      await supabase
        .from('DonationAction')
        .update({ flag_count: (currentData?.flag_count || 0) + 1 })
        .eq('id', action.id);

      toast.success("Signalement envoyé à la modération.");
    } catch (err) {
      console.error(err);
      toast.error("Échec de l'envoi du signalement.");
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
      const newAmount = newQty * (action.unit_price || 0);
      await onUpdateQuantity(action, newQty, newAmount);
      if (onActionSuccess) onActionSuccess();
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`p-4 sm:p-5 border transition-all duration-300 rounded-[2rem] relative ${
        isCompleted 
          ? 'border-green-200 bg-green-50/40 shadow-sm' 
          : 'hover:shadow-md border-border bg-card'
      }`}>
        
        {/* Bouton Signalement Discret pour les visiteurs */}
        {!isOwner && (
          <button 
            onClick={handleReport}
            disabled={isReporting}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100"
            style={{ opacity: isReporting ? 1 : undefined }} // Reste visible si en cours
          >
            <Flag className={`w-3 h-3 ${isReporting ? 'animate-pulse' : ''}`} />
          </button>
        )}

        <div className="flex gap-4 group">
          {/* Icon / Image Animée */}
          <div className={`hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center flex-shrink-0 transition-all duration-500 ${
            isCompleted ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-200' : 'bg-primary/5 text-primary/60'
          }`}>
            {action.image_url ? (
              <img src={action.image_url} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              isCompleted ? (
                <CheckCircle2 className="w-8 h-8 animate-in zoom-in duration-500" />
              ) : (
                <CategoryIcon category={action.category} size="lg" />
              )
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-bold text-lg leading-tight ${isCompleted ? 'text-green-700' : 'text-foreground'}`}>
                    {action.title}
                  </h3>
                  {isCompleted && (
                    <Badge className="bg-green-500 hover:bg-green-500 text-white border-none text-[10px] uppercase font-black animate-pulse shadow-sm">
                      <PartyPopper className="w-3 h-3 mr-1" /> Terminé !
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold bg-muted/50">
                    <CategoryIcon category={action.category} size="sm" className="mr-1" />
                    {getCategoryLabel(action.category)}
                  </Badge>
                  {action.association_name && (
                    <span className="text-xs text-muted-foreground font-medium italic opacity-80">par {action.association_name}</span>
                  )}
                  {action.is_featured && !isCompleted && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] uppercase font-bold">
                      <Star className="w-3 h-3 mr-1 fill-current" />Vedette
                    </Badge>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-amber-50 hover:text-amber-600" onClick={() => onToggleFeatured(action)}>
                    {action.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(action)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(action)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {action.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {action.description}
              </p>
            )}

            {/* BANDEAU FINANCIER */}
            <div className={`grid grid-cols-2 gap-3 mt-4 mb-2 p-3 rounded-2xl border transition-all ${
              isCompleted ? 'bg-white/80 border-green-200 shadow-inner' : 'bg-muted/30 border-border/50'
            }`}>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-70">
                  <TrendingUp className={`w-3 h-3 ${isCompleted ? 'text-green-500' : 'text-primary'}`} /> Récolté
                </span>
                <span className={`text-base font-black ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
                  {formatPrice(totalCurrent)}
                </span>
              </div>
              <div className="flex flex-col border-l pl-4 border-border/50">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-70">
                  <Target className="w-3 h-3 text-foreground" /> Objectif
                </span>
                <span className="text-base font-black text-foreground">{formatPrice(totalWanted)}</span>
              </div>
            </div>

            {/* Barre de Progression */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-xs font-medium">
                  {isCompleted ? (
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Objectif atteint !
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      <span className="font-bold text-foreground">{action.current_quantity || 0}</span>
                      <span className="mx-1">/</span>
                      {action.goal_quantity} {getCategoryLabel(action.category).toLowerCase()}s
                    </span>
                  )}
                </span>
                <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                  isCompleted ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'
                }`}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden shadow-inner p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className={`h-full rounded-full shadow-sm ${
                    isCompleted ? 'bg-green-500' : 'bg-primary'
                  }`}
                />
              </div>
            </div>

            {/* Actions Contextuelles */}
            <div className="flex items-center gap-2 mt-5 flex-wrap">
              {isOwner ? (
                <div className="flex items-center gap-1 border bg-white rounded-full p-1 shadow-sm">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-muted"
                    onClick={() => handleQuantityUpdate(Math.max(0, (action.current_quantity || 0) - 1))}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="text-sm font-black min-w-[3.5ch] text-center">{action.current_quantity || 0}</span>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-muted"
                    onClick={() => handleQuantityUpdate((action.current_quantity || 0) + 1)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={handleDonationClick}
                  className={`rounded-2xl text-xs font-bold shadow-lg px-6 h-10 transition-all active:scale-95 ${
                    isCompleted 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-100' 
                      : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                  }`}
                >
                  {(listRequireAuth === true && !user) ? (
                    <Lock className="w-4 h-4 mr-2" />
                  ) : (
                    <Heart className={`w-4 h-4 mr-2 ${isCompleted ? 'fill-white' : 'fill-current'}`} />
                  )}
                  {isCompleted ? "Faire un don supplémentaire" : "Soutenir cette action"}
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