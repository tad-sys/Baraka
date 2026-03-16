import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Leaf, Globe, Lock, ArrowRight, UserCheck, UserMinus, Loader2 } from 'lucide-react';
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
    if (!isValid) return;
    
    setLoading(true);
    console.log("🚀 Début de handleCreate...");

    try {
      // 1. Récupération utilisateur
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("❌ Erreur Auth:", userError);
        toast.error("Vous devez être connecté pour créer une liste.");
        setLoading(false);
        return;
      }

      // 2. Préparation des données (on force les types pour SQL)
      const listData = {
        title: form.title.trim(),
        type: form.type,
        description: form.description?.trim() || null,
        target_date: form.target_date || null,
        cover_image: form.cover_image?.trim() || null,
        is_public: Boolean(form.is_public),
        require_auth: Boolean(form.require_auth),
        created_by: user.email,
      };

      console.log("📦 Envoi à Supabase table 'DonationList':", listData);

      // 3. Insertion avec Timeout manuel via Promise.race si besoin, 
      // mais ici on utilise la gestion d'erreur standard
      const { data, error } = await supabase
        .from('DonationList')
        .insert([listData])
        .select()
        .single();

      if (error) {
        console.error("❌ Erreur Supabase précise:", error);
        // On affiche l'erreur SQL exacte pour débugger
        toast.error(`Erreur base de données: ${error.message}`);
        throw error;
      }

      console.log("✅ Liste créée ! ID:", data.id);
      toast.success("Votre Baraka a été créée !");
      
      // Redirection
      navigate(`/ManageList?id=${data.id}`);

    } catch (error) {
      console.error("💥 Erreur attrapée dans le catch:", error);
      // Pas de toast ici car déjà géré dans le bloc error de Supabase
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 text-foreground">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 animate-in fade-in zoom-in duration-500">
          <Leaf className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2 tracking-tight">Créer une liste</h1>
        <p className="text-muted-foreground">Regroupez vos actions de bienfaisance</p>
      </div>

      <div className="bg-card border border-border rounded-[32px] p-6 md:p-8 space-y-6 shadow-xl shadow-black/[0.02]">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold ml-1">Titre de la liste *</Label>
          <Input id="title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Notre mariage béni..." className="rounded-2xl h-12 focus-visible:ring-primary/20" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold ml-1">Type d'événement *</Label>
          <Select value={form.type} onValueChange={v => set('type', v)}>
            <SelectTrigger className="rounded-2xl h-12">
              <SelectValue placeholder="Choisir un type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {types.map(t => (
                <SelectItem key={t.value} value={t.value} className="rounded-lg">{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Public / Privé */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${form.is_public ? 'bg-primary/[0.03] border-primary/20' : 'bg-muted/30 border-border'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.is_public ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {form.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <Label className="text-sm font-bold block">Visibilité publique</Label>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {form.is_public ? "Visible par tous" : "Lien privé uniquement"}
                </p>
              </div>
            </div>
            <Switch checked={form.is_public} onCheckedChange={v => set('is_public', v)} />
          </div>

          {/* Mode de don */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${form.require_auth ? 'bg-amber-[0.03] border-amber-200' : 'bg-green-[0.03] border-green-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.require_auth ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                {form.require_auth ? <UserCheck className="w-5 h-5" /> : <UserMinus className="w-5 h-5" />}
              </div>
              <div>
                <Label className="text-sm font-bold block">Donateurs connectés</Label>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {form.require_auth ? "Compte obligatoire" : "Dons libres"}
                </p>
              </div>
            </div>
            <Switch checked={form.require_auth} onCheckedChange={v => set('require_auth', v)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold ml-1">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Expliquez votre démarche..."
            className="rounded-2xl resize-none h-24 focus-visible:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-semibold ml-1">Date limite</Label>
            <input id="date" type="date" value={form.target_date} onChange={e => set('target_date', e.target.value)} className="w-full rounded-2xl h-12 border bg-background px-3 focus:ring-2 ring-primary/20 outline-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-semibold ml-1">Image (URL)</Label>
            <Input id="image" value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="https://..." className="rounded-2xl h-12" />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleCreate} 
            disabled={!isValid || loading} 
            className="w-full rounded-2xl h-14 text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Création...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Créer ma liste <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}