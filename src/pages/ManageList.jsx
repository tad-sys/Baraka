import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card'; // Ajouté
import { Label } from '@/components/ui/label'; // Ajouté
import { Switch } from '@/components/ui/switch'; // Ajouté
import { Plus, Heart, Share2, Check, X, Clock, AlertTriangle, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { createPageUrl, formatPrice } from '@/lib/utils'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import ActionFormDialog from '@/components/list/ActionFormDialog';
import ActionListItem from '@/components/list/ActionListItem';

export default function ManageList() {
  const [searchParams] = useSearchParams();
  const listId = searchParams.get('id');
  
  const [list, setList] = useState(null);
  const [actions, setActions] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  
  const [actionToDelete, setActionToDelete] = useState(null);
  const [donationToReject, setDonationToReject] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (listId) fetchListData();
  }, [listId]);

  const fetchListData = async () => {
    try {
      const { data: listData } = await supabase.from('DonationList').select('*').eq('id', listId).single();
      setList(listData);

      const { data: actionsData } = await supabase.from('DonationAction').select('*').eq('list_id', listId).order('created_at', { ascending: false });
      setActions(actionsData || []);

      const actionIds = (actionsData || []).map(a => a.id);
      if (actionIds.length > 0) {
        const { data: proofData } = await supabase
          .from('DonationProof')
          .select('*, DonationAction(title)')
          .in('action_id', actionIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        setPendingDonations(proofData || []);
      }
    } catch (error) {
      console.error("Erreur:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- NOUVELLE FONCTION POUR LE MODE PRIVÉ ---
  const toggleAuthRequirement = async (checked) => {
    try {
      const { error } = await supabase
        .from('DonationList')
        .update({ require_auth: checked })
        .eq('id', listId);

      if (error) throw error;
      setList(prev => ({ ...prev, require_auth: checked }));
    } catch (error) {
      console.error("Erreur mise à jour accès:", error.message);
    }
  };

  const handleApproveDonation = async (donation) => {
    const { error } = await supabase.from('DonationProof').update({ status: 'approved' }).eq('id', donation.id);
    if (error) alert("Erreur: " + error.message);
    else fetchListData();
  };

  const handleConfirmRejectDonation = async () => {
    if (!donationToReject) return;
    const { error } = await supabase.from('DonationProof').update({ status: 'rejected' }).eq('id', donationToReject.id);
    if (error) alert("Erreur: " + error.message);
    else {
      setDonationToReject(null);
      fetchListData();
    }
  };

  const handleConfirmDelete = async () => {
    if (!actionToDelete) return;
    await supabase.from('DonationAction').delete().eq('id', actionToDelete.id);
    setActionToDelete(null);
    fetchListData();
  };

  const handleToggleFeatured = async (action) => {
    await supabase.from('DonationAction').update({ is_featured: !action.is_featured }).eq('id', action.id);
    fetchListData();
  };

  const handleUpdateQuantity = async (action, newQuantity) => {
    await supabase.from('DonationAction').update({ current_quantity: newQuantity }).eq('id', action.id);
    fetchListData();
  };

  const handleShare = async () => {
    const publicUrl = createPageUrl('ListDetail', { id: listId });

    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.title || 'Baraka',
          text: `Découvrez ma liste de dons : ${list?.title}`,
          url: publicUrl,
        });
      } catch (err) {
        console.log("Erreur partage:", err);
      }
    } else {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="p-10 space-y-4"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      <header className="flex justify-between items-start mb-8 text-foreground gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{list?.title}</h1>
          <p className="text-muted-foreground mt-2">{list?.description || "Ma liste Baraka"}</p>
        </div>
        <Button 
          variant={copied ? "default" : "outline"} 
          onClick={handleShare}
          className="rounded-xl transition-all shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 mr-2"/> : <Share2 className="w-4 h-4 mr-2"/>}
          {copied ? "Copié !" : "Partager"}
        </Button>
      </header>

      {/* --- NOUVEAU : RÉGLAGES D'ACCÈS --- */}
      <Card className="mb-12 p-6 border-2 border-primary/10 shadow-sm bg-gradient-to-r from-primary/5 to-transparent rounded-[2rem]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-2xl ${list?.require_auth ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
              {list?.require_auth ? <Lock size={24} /> : <Unlock size={24} />}
            </div>
            <div>
              <Label htmlFor="auth-mode" className="text-lg font-bold flex items-center gap-2">
                Mode de contribution
                {list?.require_auth && <ShieldCheck className="w-4 h-4 text-amber-500" />}
              </Label>
              <p className="text-sm text-muted-foreground max-w-md">
                {list?.require_auth 
                  ? "Seuls les utilisateurs connectés peuvent participer. Idéal pour limiter le spam." 
                  : "Tout le monde peut participer, même sans compte. Idéal pour plus de dons."}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <Switch 
              id="auth-mode" 
              checked={list?.require_auth || false} 
              onCheckedChange={toggleAuthRequirement}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {list?.require_auth ? "Connexion requise" : "Accès Libre"}
            </span>
          </div>
        </div>
      </Card>

      {/* SECTION : DONS À VALIDER */}
      {pendingDonations.length > 0 && (
        <section className="mb-12 p-6 bg-amber-50/50 border border-amber-200 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            Dons en attente de confirmation ({pendingDonations.length})
          </h2>
          <div className="space-y-3">
            {pendingDonations.map((don) => (
              <div key={don.id} className="bg-white border border-amber-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-amber-900 text-lg">{formatPrice(don.amount)}</p>
                  <p className="text-xs text-amber-700/70">Cible : {don.DonationAction?.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-amber-700 hover:bg-amber-100 rounded-xl" onClick={() => setDonationToReject(don)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-4" onClick={() => handleApproveDonation(don)}>
                    <Check className="w-4 h-4 mr-1" /> Confirmer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION ÉLÉMENTS */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
            <Heart className="w-5 h-5 text-primary" />
            Mes Actions ({actions.length})
          </h2>
          <Button onClick={() => { setEditingAction(null); setIsAdding(true); }} className="rounded-xl shadow-sm">
            <Plus className="w-4 h-4 mr-2"/> Ajouter une action
          </Button>
        </div>

        <ActionFormDialog 
          open={isAdding || !!editingAction}
          onOpenChange={(open) => { setIsAdding(open); if(!open) setEditingAction(null); }}
          listId={listId}
          editingAction={editingAction}
          onAdded={fetchListData}
        />

        <div className="grid gap-4">
          {actions.map(action => (
            <ActionListItem 
              key={action.id} 
              action={action} 
              isOwner={true}
              onDelete={() => setActionToDelete(action)}
              onEdit={(act) => setEditingAction(act)}
              onToggleFeatured={handleToggleFeatured}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
          {actions.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-[2rem] bg-muted/10 text-muted-foreground">
              <p>Votre liste est vide pour le moment.</p>
              <Button variant="link" onClick={() => setIsAdding(true)} className="text-primary p-0 h-auto">
                Ajouter votre première action de don
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ALERT DIALOGS (Confirmations) */}
      <AlertDialog open={!!actionToDelete} onOpenChange={() => setActionToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer cette action ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{actionToDelete?.title}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!donationToReject} onOpenChange={() => setDonationToReject(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser ce don ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le don de {formatPrice(donationToReject?.amount)} pour "{donationToReject?.DonationAction?.title}" ne sera pas comptabilisé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Retour</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRejectDonation}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer le refus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}