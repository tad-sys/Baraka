import { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sécurité : Vérifier si on a bien accès à la session de récupération
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Lien expiré",
          description: "Veuillez demander un nouveau lien de récupération.",
          variant: "destructive",
        });
        navigate('/Auth');
      }
    };
    checkSession();
  }, [navigate, toast]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
    }

    if (password !== confirmPassword) {
      return toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
      
      // Redirection vers les listes après réussite
      navigate('/MyLists');
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md p-8 rounded-[2.5rem] shadow-xl border-primary/5 transition-all">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">Nouveau mot de passe</h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Choisissez un mot de passe sécurisé pour finaliser la récupération.
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium ml-1 text-muted-foreground uppercase tracking-wider">Nouveau mot de passe</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl h-12 border-primary/10 focus:border-primary/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium ml-1 text-muted-foreground uppercase tracking-wider">Confirmer le mot de passe</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-xl h-12 border-primary/10 focus:border-primary/30"
            />
          </div>

          <Button className="w-full h-12 rounded-xl text-lg shadow-lg shadow-primary/10 mt-4" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
          </Button>
        </form>
      </Card>
    </div>
  );
}