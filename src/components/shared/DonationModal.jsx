import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function DonationModal({ action, onClose, onRefresh }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (parseFloat(amount) > 0) {
      setStep(2);
    }
  };

  const handleConfirmDonation = async () => {
    setLoading(true);
    try {
      // 1. Enregistrement de la preuve de don (Table DonationProof utilise 'amount')
      const { error: proofError } = await supabase
        .from('DonationProof')
        .insert([{
          action_id: action.id,
          amount: parseFloat(amount),
          status: 'completed'
        }]);

      if (proofError) throw proofError;

      // 2. Calcul des nouvelles valeurs pour l'Action
      // CORRECTION : On utilise unit_price car c'est là que se trouve le prix en base
      const pricePerUnit = Number(action.unit_price) || 1;
      const donatedUnits = parseFloat(amount) / pricePerUnit;
      const currentQty = Number(action.current_quantity) || 0;
      const newQuantity = currentQty + donatedUnits;

      // 3. Mise à jour de DonationAction (Quantité + Statut)
      const { error: actionError } = await supabase
        .from('DonationAction')
        .update({ 
          current_quantity: newQuantity,
          status: newQuantity >= (Number(action.goal_quantity) || 0) ? 'completed' : 'pending'
        })
        .eq('id', action.id);

      if (actionError) throw actionError;

      // 4. On déclenche le rafraîchissement global
      if (onRefresh) onRefresh();
      
      setStep(3);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">Quel montant souhaitez-vous offrir ?</h2>
            <p className="text-sm text-muted-foreground mt-1">Soutien pour : {action.title}</p>
          </div>
          
          <form onSubmit={handleNextStep} className="space-y-4">
            <div className="relative">
              <Input 
                type="number" 
                placeholder="0.00" 
                className="pl-8 text-lg font-bold rounded-xl h-12"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                min="1"
                step="0.01"
              />
              <span className="absolute left-3 top-3 text-lg font-bold text-muted-foreground">€</span>
            </div>
            <Button type="submit" className="w-full rounded-xl h-12 text-md">
              Continuer <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 text-center">
          <div>
            <h2 className="text-xl font-bold">Effectuer mon don de {formatPrice(amount)}</h2>
            <p className="text-sm text-muted-foreground mt-1">Cliquez sur le lien ci-dessous pour payer</p>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <Button asChild variant="default" className="w-full rounded-xl h-12 shadow-lg">
              <a href={action.payment_link} target="_blank" rel="noopener noreferrer">
                Ouvrir le lien de paiement <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-4 italic">
              Une fois votre paiement terminé sur la plateforme, cliquez sur le bouton ci-dessous :
            </p>
            <Button 
              onClick={handleConfirmDonation} 
              disabled={loading}
              className="w-full rounded-xl h-12 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : null}
              J'ai effectué mon don
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mt-2 text-muted-foreground">
              Modifier le montant
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="font-bold text-xl">Merci pour votre don !</h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Votre participation de <span className="font-bold text-foreground">{formatPrice(amount)}</span> a été ajoutée. 
            <br />
            <span className="text-green-600 font-medium italic">La barre de progression s'est mise à jour !</span>
          </p>
          <Button onClick={onClose} className="mt-8 w-full rounded-xl">
            Fermer
          </Button>
        </div>
      )}
    </div>
  );
}