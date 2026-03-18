import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { Star, Info, ImageIcon, X, Loader2, Check, ShieldCheck, Euro, AlignLeft, ChevronDown, Link as LinkIcon, Calculator } from 'lucide-react';

// --- CONSTANTES ---
const SIGHTENGINE_API_USER = '1001706285'; 
const SIGHTENGINE_API_SECRET = 'fQCZupj8LKrVygfS9PJAdqhR8euvA6Ve';

const BANNED_KEYWORDS = ['connard', 'salope', 'encule', 'nazi', 'raciste', 'crypto', 'bitcoin', 'casino', 'poker', 'argent facile', 'sexe', 'porno', 'escorte', 'drogue'];

const PARTNER_ASSOCIATIONS = [
  { id: 'custom', name: 'Autre association (Saisie libre)', domain: '', defaultLink: '' },
  { id: 'msf', name: 'Médecins Sans Frontières (MSF)', domain: 'msf.fr', defaultLink: 'https://www.msf.fr/donner' },
  { id: 'croix-rouge', name: 'Croix-Rouge Française', domain: 'croix-rouge.fr', defaultLink: 'https://donner.croix-rouge.fr/' },
  { id: 'secours-populaire', name: 'Secours Populaire', domain: 'secours-populaire.fr', defaultLink: 'https://don.secours-populaire.fr/' },
  { id: 'restos-coeur', name: 'Les Restos du Cœur', domain: 'restosducoeur.org', defaultLink: 'https://dons.restosducoeur.org/' },
  // LIEN ACDL MIS À JOUR POUR ÉVITER LA 404
  { id: 'acdl', name: 'Au Cœur de la Précarité (ACDL)', domain: 'aucoeurdelaprecarite.org', defaultLink: 'https://aucoeurdelaprecarite.org/donner/' },
  { id: 'life', name: 'LIFE (ONG)', domain: 'association-life.org', defaultLink: 'https://www.association-life.org/faire-un-don/' },
  { id: 'human-appeal', name: 'Human Appeal France', domain: 'humanappeal.fr', defaultLink: 'https://humanappeal.fr/donner' },
  { id: 'islamic-relief', name: 'Islamic Relief France', domain: 'islamic-relief.fr', defaultLink: 'https://don.islamic-relief.fr/' },
  { id: 'sif', name: 'Secours Islamique France (SIF)', domain: 'secours-islamique.org', defaultLink: 'https://don.secours-islamique.org/' },
  { id: 'unicef', name: 'UNICEF France', domain: 'unicef.fr', defaultLink: 'https://don.unicef.fr/' },
  { id: 'wwf', name: 'WWF France', domain: 'wwf.fr', defaultLink: 'https://faire-un-don.wwf.fr/' },
  { id: 'spa', name: 'La SPA', domain: 'la-spa.fr', defaultLink: 'https://donner.la-spa.fr/' }
];

const categories = ['arbre', 'repas', 'puits', 'maison', 'mosquee', 'ecole', 'orphelin', 'mariage', 'cadeau', 'autre'];

export default function ActionFormDialog({ open, onOpenChange, onAdded, listId, editingAction }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPartnerList, setShowPartnerList] = useState(false);
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    title: '', description: '', category: 'autre', unit_price: '',
    goal_quantity: '', goal_amount: '0.00', payment_link: '',
    image_url: '', association_name: '', is_featured: false,
  });

  useEffect(() => {
    if (open) {
      if (editingAction) {
        setForm({
          title: editingAction.title || '',
          description: editingAction.description || '',
          category: editingAction.category || 'autre',
          unit_price: editingAction.unit_price?.toString() || '',
          goal_quantity: editingAction.goal_quantity?.toString() || '',
          goal_amount: editingAction.goal_amount?.toString() || '0.00',
          payment_link: editingAction.payment_link || '',
          image_url: editingAction.image_url || '',
          association_name: editingAction.association_name || '',
          is_featured: !!editingAction.is_featured,
        });
      } else {
        setForm({
          title: '', description: '', category: 'autre', unit_price: '',
          goal_quantity: '', goal_amount: '0.00', payment_link: '', image_url: '', 
          association_name: '', is_featured: false,
        });
      }
    }
  }, [editingAction, open]);

  const updateAmounts = (price, qty) => {
    const p = parseFloat(price) || 0;
    const q = parseInt(qty, 10) || 0;
    return (p * q).toFixed(2);
  };

  const handlePriceChange = (val) => {
    setForm(prev => ({ ...prev, unit_price: val, goal_amount: updateAmounts(val, prev.goal_quantity) }));
  };

  const handleQtyChange = (val) => {
    setForm(prev => ({ ...prev, goal_quantity: val, goal_amount: updateAmounts(prev.unit_price, val) }));
  };

  const checkContentSafety = (text) => {
    if (!text) return true;
    const lowerText = text.toLowerCase();
    return !BANNED_KEYWORDS.some(word => lowerText.includes(word));
  };

  const checkImageSafety = async (file) => {
    const formData = new FormData();
    formData.append('media', file);
    formData.append('models', 'nudity-2.0,wad,violence,scam');
    formData.append('api_user', SIGHTENGINE_API_USER);
    formData.append('api_secret', SIGHTENGINE_API_SECRET);
    try {
      const response = await fetch('https://api.sightengine.com/1.0/check.json', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.status === 'success') {
        const nudity = data.nudity.sexual_display > 0.5 || data.nudity.erotica > 0.5;
        if (nudity) return { safe: false, message: "⚠️ Image non autorisée." };
      }
      return { safe: true };
    } catch (e) { return { safe: true }; }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const safety = await checkImageSafety(file);
      if (!safety.safe) {
        toast.error(safety.message);
        return;
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${listId}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('action-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('action-images').getPublicUrl(filePath);
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image chargée !");
    } catch (error) {
      toast.error(`Erreur upload : ${error.message}`);
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkContentSafety(form.title) || !checkContentSafety(form.description)) {
      toast.error("Contenu inapproprié détecté.");
      return;
    }

    // --- NETTOYAGE ET VALIDATION DU LIEN ---
    let cleanLink = form.payment_link?.trim() || '';
    if (cleanLink && !cleanLink.startsWith('http')) {
      cleanLink = `https://${cleanLink}`;
    }

    setLoading(true);
    
    const actionData = {
      list_id: listId,
      title: form.title.trim(),
      description: form.description?.trim() || null,
      category: form.category || "autre",
      unit_price: parseFloat(form.unit_price) || 0,
      goal_quantity: parseInt(form.goal_quantity, 10) || 0,
      goal_amount: parseFloat(form.goal_amount) || 0,
      payment_link: cleanLink || null, // Utilisation du lien nettoyé
      image_url: form.image_url || null,
      association_name: form.association_name?.trim() || null,
      is_featured: Boolean(form.is_featured),
    };

    try {
      let error;
      if (editingAction) {
        const { error: updateError } = await supabase
          .from('DonationAction')
          .update(actionData)
          .eq('id', editingAction.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('DonationAction')
          .insert([actionData]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingAction ? "Action modifiée !" : "Action créée !");
      onOpenChange(false);
      if (onAdded) onAdded();
    } catch (err) {
      toast.error(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = PARTNER_ASSOCIATIONS.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95%] max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl bg-background">
        <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-primary/5 to-transparent">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {editingAction ? <Info className="w-5 h-5" /> : <Star className="w-5 h-5" />}
            </div>
            {editingAction ? "Modifier l'action" : "Nouvelle action"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-5">
          {/* Illustration */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold ml-1">Illustration</Label>
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="relative h-44 w-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              {form.image_url ? (
                <>
                  <img src={form.image_url} className="w-full h-full object-cover" alt="Illustration" />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-3 right-3 rounded-full h-8 w-8" onClick={(e) => { e.stopPropagation(); setForm({...form, image_url: ''}); }}><X className="w-4 h-4" /></Button>
                </>
              ) : (
                <div className="text-center">
                  {uploading ? <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /> : <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />}
                  <p className="text-xs mt-2 font-bold">Ajouter une photo</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-2">
            <Label className="ml-1">Titre *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Panier repas" required className="rounded-2xl h-12" />
          </div>

          {/* Calculs Financiers */}
          <div className="p-5 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-primary/80 flex items-center gap-1 ml-1"><Euro className="w-3 h-3" /> Prix unitaire</Label>
                <Input type="number" step="0.01" value={form.unit_price} onChange={(e) => handlePriceChange(e.target.value)} className="rounded-xl bg-white h-11" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-primary/80 flex items-center gap-1 ml-1"><Check className="w-3 h-3" /> Quantité</Label>
                <Input type="number" value={form.goal_quantity} onChange={(e) => handleQtyChange(e.target.value)} className="rounded-xl bg-white h-11" placeholder="1" required />
              </div>
            </div>
            <div className="text-center border-t border-primary/10 pt-3 flex items-center justify-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <p className="text-sm text-primary font-black uppercase tracking-tight">Objectif total : {form.goal_amount} €</p>
            </div>
          </div>

          {/* Sélecteur ONG */}
          <div className="space-y-2 p-4 bg-muted/20 rounded-[2rem] border relative">
            <Label className="text-sm font-bold flex items-center gap-2 ml-1"><ShieldCheck className="w-4 h-4 text-primary" /> Partenaire ONG</Label>
            <div className="relative">
              <button 
                type="button" 
                onClick={() => setShowPartnerList(!showPartnerList)} 
                className="w-full flex items-center justify-between px-4 h-12 bg-white border rounded-2xl text-sm transition-all hover:border-primary/30"
              >
                <span className="truncate">{form.association_name || "Choisir une ONG..."}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showPartnerList ? 'rotate-180' : ''}`} />
              </button>
              
              {showPartnerList && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowPartnerList(false)} />
                  <div className="absolute z-[70] w-full mt-2 bg-white border rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto left-0">
                    <div className="sticky top-0 bg-white pb-2 z-10">
                      <Input 
                        placeholder="Rechercher..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="h-10 rounded-xl" 
                      />
                    </div>
                    {filteredPartners.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => { 
                          setForm({...form, association_name: p.name, payment_link: p.defaultLink}); 
                          setShowPartnerList(false); 
                        }} 
                        className="p-3 hover:bg-primary/5 rounded-lg cursor-pointer text-sm border-b last:border-none"
                      >
                        {p.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-1 ml-1"><LinkIcon className="w-3 h-3" /> Lien de paiement direct</Label>
            <Input value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} placeholder="Lien vers la collecte (HelloAsso, MSF...)" className="rounded-2xl h-12" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="ml-1">Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="rounded-2xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl border bg-card self-end h-12">
              <Label className="text-xs font-bold text-yellow-600">Mettre en avant</Label>
              <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-1 ml-1"><AlignLeft className="w-3 h-3" /> Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails de l'action..." className="rounded-2xl min-h-[80px]" />
          </div>

          <DialogFooter className="pt-4 gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-12">Annuler</Button>
            <Button type="submit" disabled={loading || uploading} className="rounded-2xl h-12 px-8 bg-primary font-bold text-white flex-1 transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingAction ? 'Enregistrer les modifications' : 'Créer l\'action')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}