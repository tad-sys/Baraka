import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Heart, Share2, Check, X, Clock, AlertTriangle, 
  Lock, Unlock, ShieldCheck, Trash2 
} from 'lucide-react';
import { createPageUrl, formatPrice } from '@/lib/utils'; 
import { toast } from "sonner";
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
  const navigate = useNavigate();
  const listId = searchParams.get('id');
  
  const [list, setList] = useState(null);
  const [actions, setActions] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  
  const [actionToDelete, setActionToDelete] = useState(null);
  const [listToDelete, setListToDelete] = useState(false); // Nouvel état pour la liste
  const [donationToReject, setDonationToReject] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!listId) {
      toast.error("ID de liste manquant");
      navigate('/');
      return;
    }
    fetchListData();
  }, [listId]);

  const fetchListData = async () => {
    try {
      const { data: listData, error: listError } = await supabase
        .from('DonationList')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) throw listError;
      setList(listData);

      const { data: actionsData, error: actionsError } = await supabase
        .from('DonationAction')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      if (actionsError) throw actionsError;
      setActions(actionsData || []);

      const actionIds = (actionsData || []).map(a => a.id);
      if (actionIds.length > 0) {
        const { data: proofData, error: proofError } = await supabase
          .from('DonationProof')
          .select('*, DonationAction(title)')
          .in('action_id', actionIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (!proofError) setPendingDonations(proofData || []);
      }
    } catch (error) {
      toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  // NOUVELLE FONCTION : SUPPRIMER TOUTE LA LISTE
  const handleConfirmDeleteList = async () => {
    try {
      const { error } = await supabase
        .from('DonationList')
        .delete()
        .eq('id', listId);

      if (error) throw error;
      toast.success("Liste supprimée définitivement");
      navigate('/'); // Retour à l'accueil ou au dashboard
    } catch (error) {
      toast.error("Erreur lors de la suppression : " + error.message);
    }
  };

  const toggleAuthRequirement = async (checked) => {
    try {
      const { error } = await supabase
        .from('DonationList')
        .update({ require_auth: checked })
        .eq('id', listId);

      if (error) throw error;
      setList(prev => ({ ...prev, require_auth: checked }));
      toast.success(checked ? "Connexion requise" : "Accès libre");
    } catch (error) {
      toast.error("Erreur de mise à jour");
    }
  };

  const handleApproveDonation = async (donation) => {
    try {
      const { error } = await supabase
        .from('DonationProof')
        .update({ status: 'approved' })
        .eq('id', donation.id);
      
      if (error) throw error;
      toast.success("Don approuvé");
      fetchListData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleConfirmRejectDonation = async () => {
    if (!donationToReject) return;
    try {
      const { error } = await supabase
        .from('DonationProof')
        .update({ status: 'rejected' })
        .eq('id', donationToReject.id);
      
      if (error) throw error;
      toast.info("Don refusé");
      setDonationToReject(null);
      fetchListData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!actionToDelete) return;
    try {
      const { error } = await supabase
        .from('DonationAction')
        .delete()
        .eq('id', actionToDelete.id);
      
      if (error) throw error;
      toast.success("Action supprimée");
      setActionToDelete(null);
      fetchListData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleFeatured = async (action) => {
    try {
      const { error } = await supabase
        .from('DonationAction')
        .update({ is_featured: !action.is_featured })
        .eq('id', action.id);
      
      if (error) throw error;
      fetchListData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateQuantity = async (action, newQuantity) => {
    try {
      const { error } = await supabase
        .from('DonationAction')
        .update({ current_quantity: newQuantity })
        .eq('id', action.id);
      
      if (error) throw error;
      fetchListData();
    } catch (error) {
      toast.error(error.message);
    }
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
      toast.success("Lien copié");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto p-10 space-y-8">
      <Skeleton className="h-12 w-3/4 rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-[2rem]" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start mb-8 text-foreground gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{list?.title}</h1>
          <p className="text-muted-foreground mt-2">{list?.description || "Ma liste Baraka"}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setListToDelete(true)}
            className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            variant={copied ? "default" : "outline"} 
            onClick={handleShare}
            className="rounded-xl shadow-sm flex-1 sm:flex-none"
          >
            {copied ? <Check className="w-4 h-4 mr-2"/> : <Share2 className="w-4 h-4 mr-2"/>}
            {copied ? "Copié !" : "Partager"}
          </Button>
        </div>
      </header>

      {/* ... (Reste du composant identique : Card de Visibilité, Dons en attente) ... */}
      
      <Card className="mb-12 p-6 border-2 border-primary/10 shadow-sm bg-gradient-to-r from-primary/5 to-transparent rounded-[2rem]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className={`p-3 rounded-2xl ${list?.require_auth ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
              {list?.require_auth ? <Lock size={24} /> : <Unlock size={24} />}
            </div>
            <div>
              <Label htmlFor="auth-mode" className="text-lg font-bold flex items-center gap-2">
                Mode de contribution
              </Label>
              <p className="text-sm text-muted-foreground max-w-md">
                {list?.require_auth ? "Connexion obligatoire." : "Participation libre."}
              </p>
            </div>
          </div>
          <Switch 
            checked={list?.require_auth || false} 
            onCheckedChange={toggleAuthRequirement}
          />
        </div>
      </Card>

      {/* SECTION ÉLÉMENTS */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Mes Actions ({actions.length})
          </h2>
          <Button onClick={() => { setEditingAction(null); setIsAdding(true); }} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2"/> Ajouter
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
        </div>
      </section>

      {/* ALERT DIALOG : SUPPRESSION LISTE */}
      <AlertDialog open={listToDelete} onOpenChange={setListToDelete}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer toute la liste ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les actions et les preuves de dons associées seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteList} className="rounded-xl bg-destructive text-white hover:bg-destructive/90">
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ... (Autres Dialogs pour Action et Dons) ... */}
      <AlertDialog open={!!actionToDelete} onOpenChange={() => setActionToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette action ?</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer "{actionToDelete?.title}" ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="rounded-xl bg-destructive">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}