import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, ExternalLink, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function DonationModal({ action, onClose, onRefresh }) {
  const { user } = useAuth(); // Récupération de l'utilisateur pour lier le don
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ÉTAPE 1 : Validation du montant ---
  const handleNextStep = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val > 0) {
      setStep(2);
    } else {
      toast.error("Veuillez saisir un montant supérieur à 0€");
    }
  };

  // --- ÉTAPE 2 : Confirmation après paiement externe ---
  const handleConfirmDonation = async () => {
    setLoading(true);
    try {
      // On insère uniquement la preuve de don. 
      // Le Trigger SQL 'tr_after_donation_insert' mettra à jour 'DonationAction' automatiquement.
      const { error: proofError } = await supabase
        .from('DonationProof')
        .insert([{
          action_id: action.id,
          amount: parseFloat(amount),
          user_id: user?.id || null, // Lie le don si l'utilisateur est connecté
          status: 'completed'
        }]);

      if (proofError) throw proofError;

      // Déclenche le rafraîchissement de la liste parente
      if (onRefresh) onRefresh();
      
      setStep(3);
    } catch (error) {
      console.error("Erreur enregistrement don:", error);
      toast.error("Impossible de valider le don : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card">
      {/* ÉTAPE 1 : SAISIE DU MONTANT */}
      {step === 1 && (
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-7 h-7 text-primary fill-primary/20" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Soutenir l'action</h2>
            <p className="text-sm text-muted-foreground font-medium italic truncate">
              "{action.title}"
            </p>
          </div>
          
          <form onSubmit={handleNextStep} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">
                Combien souhaitez-vous offrir ?
              </label>
              <div className="relative group">
                <Input 
                  type="number" 
                  placeholder="10.00" 
                  className="pl-12 text-2xl font-black rounded-2xl h-16 border-2 focus-visible:ring-primary/20 transition-all shadow-sm"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                  min="1"
                  step="0.01"
                  autoFocus
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground group-focus-within:text-primary transition-colors">€</span>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/10 hover:translate-y-[-2px] active:translate-y-0 transition-all">
              Continuer <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </div>
      )}

      {/* ÉTAPE 2 : PAIEMENT EXTERNE */}
      {step === 2 && (
        <div className="p-8 space-y-6 text-center animate-in fade-in slide-in-from-right-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">Paiement sécurisé</h2>
            <p className="text-sm text-muted-foreground">
              Pour finaliser votre don de <span className="text-foreground font-black">{formatPrice(amount)}</span>, cliquez sur le bouton ci-dessous :
            </p>
          </div>

          <div className="p-6 bg-muted/30 rounded-[2rem] border-2 border-dashed border-border space-y-4">
            <Button asChild className="w-full rounded-xl h-14 text-md font-bold bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all">
              <a href={action.payment_link} target="_blank" rel="noopener noreferrer">
                Ouvrir le lien de l'association <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <p className="text-[10px] text-muted-foreground leading-tight italic">
              Le paiement s'effectue sur une page externe sécurisée.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleConfirmDonation} 
              disabled={loading}
              className="w-full rounded-2xl h-14 bg-green-600 hover:bg-green-700 text-white font-black text-lg shadow-lg shadow-green-100 transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              J'ai effectué mon don
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-muted-foreground font-bold">
              ← Modifier le montant
            </Button>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : SUCCÈS */}
      {step === 3 && (
        <div className="p-10 text-center space-y-6 animate-in zoom-in duration-300">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 text-amber-400 w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="font-black text-3xl tracking-tight">C'est fait !</h3>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              Merci pour votre générosité. Votre don de <span className="font-bold text-foreground">{formatPrice(amount)}</span> fait avancer cette cause.
            </p>
          </div>

          <div className="py-2">
            <div className="h-1.5 w-full bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full animate-progress-fast" />
            </div>
            <p className="text-[10px] text-green-600 font-bold uppercase mt-2 tracking-widest">
              Action mise à jour en temps réel
            </p>
          </div>

          <Button onClick={onClose} className="w-full rounded-2xl h-14 font-black text-lg bg-foreground text-background hover:opacity-90 transition-opacity">
            Super, merci !
          </Button>
        </div>
      )}
    </div>
  );
}