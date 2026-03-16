import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Ajout de useSearchParams
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false); 
  
  const { signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Pour lire le paramètre ?redirect=
  const { toast } = useToast();

  // On récupère l'URL de redirection si elle existe
  const redirectToParam = searchParams.get('redirect');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const origin = window.location.origin;
      const path = window.location.pathname.endsWith('/') 
                   ? window.location.pathname 
                   : window.location.pathname + '/';
      const baseUrl = origin + path;

      if (mode === 'forgot') {
        const redirectTo = `${baseUrl}#/ResetPassword`;
        const { error } = await resetPassword(email, { redirectTo });
        
        if (error) throw error;

        setEmailSent(true);
        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte mail immédiatement.",
        });

      } else {
        const { error } = mode === 'signup' 
          ? await signUp(email, password, { redirectTo: baseUrl }) 
          : await signIn(email, password);
        
        if (error) throw error;

        if (mode === 'login') {
          toast({ title: "Connexion réussie" });
          
          // --- LOGIQUE DE REDIRECTION INTELLIGENTE ---
          if (redirectToParam) {
            // Si on vient d'une liste (ex: ListDetail), on y retourne
            navigate(decodeURIComponent(redirectToParam));
          } else {
            // Sinon, chemin par défaut
            navigate('/MyLists');
          }
        } else {
          toast({ title: "Inscription", description: "Vérifiez votre boîte mail." });
          // Note: Pour l'inscription avec confirmation d'email, la redirection 
          // se gère généralement via le lien reçu par mail (redirectTo: baseUrl).
        }
      }
    } catch (error) {
      console.error("ERREUR AUTH:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de traiter la demande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setMode('login');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {/* Petit message contextuel si on vient d'une liste */}
      {redirectToParam && !emailSent && (
        <div className="absolute top-10 bg-primary/10 text-primary text-xs py-2 px-4 rounded-full font-medium animate-bounce">
          Connectez-vous pour finaliser votre don
        </div>
      )}

      <Card className="w-full max-w-md p-8 rounded-[2.5rem] shadow-xl border-primary/5 relative overflow-hidden">
        {emailSent ? (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-green-500/80 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Lien envoyé !</h1>
            <p className="text-muted-foreground mb-8 text-sm px-4">
              Un email a été envoyé à <span className="font-semibold text-foreground italic">{email}</span>.
              <br/><br/>
              Vérifiez vos spams si besoin.
            </p>
            <Button variant="outline" onClick={handleBackToLogin} className="w-full rounded-xl h-12">
              Retour à la connexion
            </Button>
          </div>
        ) : (
          <>
            {mode === 'forgot' && (
              <button onClick={() => setMode('login')} className="absolute top-8 left-8 text-muted-foreground hover:text-primary flex items-center text-xs transition-colors">
                <ArrowLeft className="w-3 h-3 mr-1" /> Retour
              </button>
            )}

            <h1 className="text-3xl font-bold text-center mb-2 mt-2">
              {mode === 'login' ? 'Bon retour !' : mode === 'signup' ? 'Créer un compte' : 'Récupération'}
            </h1>
            <p className="text-muted-foreground text-center mb-8 text-sm px-4">
              {mode === 'login' && 'Connectez-vous pour gérer vos listes'}
              {mode === 'signup' && "Rejoignez Baraka aujourd'hui"}
              {mode === 'forgot' && "Entrez votre email pour recevoir un lien"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="rounded-xl h-12"
                />
              </div>
              
              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <Input 
                    type="password" 
                    placeholder="Mot de passe" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="rounded-xl h-12"
                  />
                  {mode === 'login' && (
                    <div className="text-right">
                      <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary/70 hover:text-primary transition-colors font-medium">
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button className="w-full h-12 rounded-xl text-lg shadow-lg mt-2" disabled={loading}>
                {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? "S'inscrire" : 'Envoyer le lien'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
              <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {mode === 'signup' ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}