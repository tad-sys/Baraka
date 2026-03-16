import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Euro, Info } from 'lucide-react';

const categories = [
  { value: 'arbre', label: "🌳 Plantation d'arbre" },
  { value: 'repas', label: '🍽️ Distribution de repas' },
  { value: 'puits', label: '💧 Construction de puits' },
  { value: 'maison', label: '🏠 Construction de maison' },
  { value: 'mosquee', label: '🕌 Construction de mosquée' },
  { value: 'ecole', label: "🏫 Construction d'école" },
  { value: 'orphelin', label: '🤍 Soutien aux orphelins' },
  { value: 'mariage', label: '💍 Cadeau de mariage' },
  { value: 'cadeau', label: '🎁 Cadeau' },
  { value: 'autre', label: '✨ Autre' },
];

const defaultForm = {
  title: '',
  description: '',
  category: '',
  unit_price: '',
  goal_quantity: '',
  goal_amount: '',
  association_name: '',
  payment_link: '',
  image_url: '',
};

export default function ActionForm({ open, onOpenChange, action, onSave, listId }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (action) {
      setForm({
        title: action.title || '',
        description: action.description || '',
        category: action.category || '',
        unit_price: action.unit_price || '',
        goal_quantity: action.goal_quantity || '',
        goal_amount: action.goal_amount || '',
        association_name: action.association_name || '',
        payment_link: action.payment_link || '',
        image_url: action.image_url || '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [action, open]);

  // LOGIQUE DE CALCUL AUTOMATIQUE DE L'OBJECTIF FINANCIER
  useEffect(() => {
    const price = parseFloat(form.unit_price) || 0;
    const qty = parseInt(form.goal_quantity) || 0;
    if (price > 0 && qty > 0) {
      setForm(prev => ({ ...prev, goal_amount: (price * qty).toFixed(2) }));
    }
  }, [form.unit_price, form.goal_quantity]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = () => {
    if (!form.title || !form.unit_price || !form.goal_quantity) return;
    
    onSave({
      ...form,
      unit_price: parseFloat(form.unit_price),
      goal_quantity: parseInt(form.goal_quantity),
      goal_amount: parseFloat(form.goal_amount),
      list_id: listId,
      // On initialise le montant à 0 si c'est une création
      ...(action ? {} : { amount: 0, current_quantity: 0 }),
      is_featured: action?.is_featured || false,
    });
  };

  const isValid = form.title && form.unit_price && form.goal_quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[2rem] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="font-display text-2xl text-foreground flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Info className="w-5 h-5" />
            </div>
            {action ? "Modifier l'action" : 'Nouvelle action'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold ml-1">Titre de l'action <span className="text-destructive">*</span></Label>
            <Input 
              value={form.title} 
              onChange={e => set('title', e.target.value)} 
              placeholder="Ex: Planter un arbre en Palestine" 
              className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/20" 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold ml-1">Catégorie</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger className="h-12 rounded-2xl bg-muted/50 border-none">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value} className="rounded-lg">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold ml-1">Description</Label>
            <Textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décrivez l'impact de ce don..."
              className="rounded-2xl resize-none h-24 bg-muted/50 border-none focus-visible:ring-primary/20"
            />
          </div>

          <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary/80 flex items-center gap-1">
                  <Euro className="w-3 h-3" /> Prix unitaire (€)
                </Label>
                <Input 
                  type="number" 
                  value={form.unit_price} 
                  onChange={e => set('unit_price', e.target.value)} 
                  placeholder="Ex: 5" 
                  className="h-11 rounded-xl bg-white border-none shadow-sm" 
                  min="0" 
                  step="0.01" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-primary/80 flex items-center gap-1">
                  <Target className="w-3 h-3" /> Quantité cible
                </Label>
                <Input 
                  type="number" 
                  value={form.goal_quantity} 
                  onChange={e => set('goal_quantity', e.target.value)} 
                  placeholder="Ex: 100" 
                  className="h-11 rounded-xl bg-white border-none shadow-sm" 
                  min="1" 
                />
              </div>
            </div>

            <div className="pt-2 border-t border-primary/10">
              <div className="flex justify-between items-center text-sm font-bold text-primary">
                <span>Objectif financier :</span>
                <span className="text-lg">{form.goal_amount || 0} €</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold ml-1">Lien de paiement</Label>
            <Input 
              value={form.payment_link} 
              onChange={e => set('payment_link', e.target.value)} 
              placeholder="https://link.myamana.fr/..." 
              className="h-12 rounded-2xl bg-muted/50 border-none focus-visible:ring-primary/20" 
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={handleSave} disabled={!isValid} className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all">
              {action ? 'Enregistrer les modifications' : 'Ajouter à ma liste'}
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-2xl text-muted-foreground font-medium">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}