import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Leaf, Globe, Lock, UserCheck, UserMinus, Loader2, Calendar, Image as ImageIcon } from 'lucide-react';
import { toast } from "sonner";

const types = [
  { value: 'mariage', label: '💍 Mariage' },
  { value: 'association', label: '🤲 Association / Cause' },
  { value: 'naissance', label: '👶 Naissance' },
  { value: 'aqiqa', label: '🐑 Aqiqa' },
  { value: 'autre', label: '✨ Autre événement' },
];

export default function CreateList() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    type: '', 
    cover_image: '', 
    target_date: '',
    is_public: true,
    require_auth: false 
  });
  const [loading, setLoading] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const isValid = form.title.trim() && form.type;

  const handleCreate = async () => {
    if (!isValid) {
      toast.error("Veuillez remplir le titre et le type.");
      return;
    }
    
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error("Session expirée. Reconnectez-vous.");
        setLoading(false);
        return;
      }

      const listData = {
        title: form.title.trim(),
        type: form.type,
        created_by: user.email,
        is_public: Boolean(form.is_public),
        require_auth: Boolean(form.require_auth),
        description: form.description?.trim() || null,
        target_date: form.target_date || null,
        cover_image: form.cover_image?.trim() || null
      };

      const { data, error } = await supabase
        .from('DonationList')
        .insert([listData])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        toast.success("Liste créée avec succès !");
        navigate(`/ManageList?id=${data[0].id}`);
      }

    } catch (err) {
      console.error("Erreur:", err);
      toast.error("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 text-foreground">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <Leaf className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2 tracking-tight">Créer une liste</h1>
      </div>

      <div className="bg-card border border-border rounded-[32px] p-6 md:p-8 space-y-6 shadow-xl">
        {/* Titre & Type */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold ml-1">Titre de la liste *</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Notre mariage..." className="rounded-2xl h-12" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold ml-1">Type d'événement *</Label>
            <Select value={form.type} onValueChange={v => set('type', v)}>
              <SelectTrigger className="rounded-2xl h-12">
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {types.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options de visibilité */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/20">
            <div className="flex items-center gap-3">
              {form.is_public ? <Globe className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
              <Label className="text-sm font-bold">Liste Publique</Label>
            </div>
            <Switch checked={form.is_public} onCheckedChange={v => set('is_public', v)} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border bg-muted/20">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-primary" />
              <Label className="text-sm font-bold">Connexion requise pour donner</Label>
            </div>
            <Switch checked={form.require_auth} onCheckedChange={v => set('require_auth', v)} />
          </div>
        </div>

        {/* Champs optionnels */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold ml-1">Description</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} className="rounded-2xl h-24" placeholder="Détails de votre projet..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4"/> Date limite</Label>
              <Input type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} className="rounded-2xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Image (URL)</Label>
              <Input value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="https://..." className="rounded-2xl h-12" />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleCreate} 
          disabled={loading} 
          className="w-full rounded-2xl h-14 text-base font-bold shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer ma liste"}
        </Button>
      </div>
    </div>
  );
}