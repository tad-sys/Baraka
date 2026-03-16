import React, { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Trash2, Eye, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner'; // Ou ton système de notification habituel

export default function AdminModeration() {
  const [flaggedLists, setFlaggedLists] = useState([]);
  const [flaggedActions, setFlaggedActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async () => {
    setLoading(true);
    try {
      // Récupérer les listes signalées (flag_count > 0)
      const { data: lists } = await supabase
        .from('DonationList')
        .select('*')
        .gt('flag_count', 0)
        .order('flag_count', { ascending: false });

      // Récupérer les actions signalées (flag_count > 0)
      const { data: actions } = await supabase
        .from('DonationAction')
        .select('*, DonationList(title)')
        .gt('flag_count', 0)
        .order('flag_count', { ascending: false });

      setFlaggedLists(lists || []);
      setFlaggedActions(actions || []);
    } catch (error) {
      console.error("Erreur chargement modération:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (table, id, action) => {
    try {
      if (action === 'approve') {
        // On remet le compteur à 0 et on passe en statut 'active'
        await supabase
          .from(table)
          .update({ flag_count: 0, moderation_status: 'active' })
          .eq('id', id);
        toast.success("Contenu approuvé et réinitialisé");
      } else if (action === 'ban') {
        // On marque comme banni
        await supabase
          .from(table)
          .update({ moderation_status: 'banned' })
          .eq('id', id);
        toast.error("Contenu banni du site");
      }
      fetchFlaggedContent(); // Rafraîchir la liste
    } catch (error) {
      toast.error("Erreur lors de la modération");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display">Centre de Modération</h1>
          <p className="text-muted-foreground">Gérez les signalements de la communauté</p>
        </div>
      </div>

      <Tabs defaultValue="lists" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="lists" className="rounded-lg">Listes ({flaggedLists.length})</TabsTrigger>
          <TabsTrigger value="actions" className="rounded-lg">Actions/Articles ({flaggedActions.length})</TabsTrigger>
        </TabsList>

        {/* ONGLET LISTES */}
        <TabsContent value="lists">
          <div className="grid gap-4">
            {flaggedLists.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground italic">Aucune liste signalée pour le moment. ✨</p>
            ) : (
              flaggedLists.map(list => (
                <ModerationCard 
                  key={list.id}
                  title={list.title}
                  description={list.description}
                  flags={list.flag_count}
                  status={list.moderation_status}
                  onApprove={() => handleModerate('DonationList', list.id, 'approve')}
                  onBan={() => handleModerate('DonationList', list.id, 'ban')}
                  viewUrl={`/ListDetail?id=${list.id}`}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* ONGLET ACTIONS */}
        <TabsContent value="actions">
          <div className="grid gap-4">
            {flaggedActions.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground italic">Aucune action signalée. ✨</p>
            ) : (
              flaggedActions.map(action => (
                <ModerationCard 
                  key={action.id}
                  title={action.title}
                  description={`Dans la liste: ${action.DonationList?.title || 'Inconnue'}`}
                  flags={action.flag_count}
                  status={action.moderation_status}
                  onApprove={() => handleModerate('DonationAction', action.id, 'approve')}
                  onBan={() => handleModerate('DonationAction', action.id, 'ban')}
                  viewUrl={`/ListDetail?id=${action.list_id}`}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sous-composant pour les lignes de modération
function ModerationCard({ title, description, flags, status, onApprove, onBan, viewUrl }) {
  return (
    <Card className="p-6 border-none shadow-sm bg-card flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg">{title}</h3>
          <Badge variant={flags >= 5 ? "destructive" : "outline"} className="gap-1">
            <AlertTriangle className="w-3 h-3" /> {flags} signalements
          </Badge>
          {status === 'banned' && <Badge className="bg-gray-500 text-white">Banni</Badge>}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={viewUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2" /> Voir</a>
        </Button>
        <Button variant="outline" size="sm" onClick={onApprove} className="text-green-600 hover:text-green-700 hover:bg-green-50">
          <CheckCircle className="w-4 h-4 mr-2" /> Approuver
        </Button>
        <Button variant="destructive" size="sm" onClick={onBan}>
          <Trash2 className="w-4 h-4 mr-2" /> Bannir
        </Button>
      </div>
    </Card>
  );
}