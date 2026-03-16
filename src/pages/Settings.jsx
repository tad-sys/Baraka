import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { User, Lock, ShieldCheck, Mail, BellRing } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  // État pour les notifications (récupéré depuis les métadonnées de l'utilisateur)
  const [emailNotifications, setEmailNotifications] = useState(
    user?.user_metadata?.email_notifications ?? true
  );

  // --- MISE À JOUR DU MOT DE PASSE ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return toast({
        variant: "destructive",
        title: "Trop court",
        description: "Le mot de passe doit faire au moins 6 caractères."
      });
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } else {
      toast({ title: "Succès", description: "Votre mot de passe a été mis à jour." });
      setNewPassword('');
    }
    setLoading(false);
  };

  // --- MISE À JOUR DES PRÉFÉRENCES NOTIFICATIONS ---
  const toggleNotifications = async (checked) => {
    setEmailNotifications(checked);
    
    const { error } = await supabase.auth.updateUser({
      data: { email_notifications: checked }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder votre préférence."
      });
      setEmailNotifications(!checked); // Revenir en arrière en cas d'erreur
    } else {
      toast({
        title: "Préférence mise à jour",
        description: checked ? "Notifications activées." : "Notifications désactivées."
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Gérez votre compte et vos préférences de communication.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        
        {/* SECTION PROFIL & NOTIFICATIONS */}
        <div className="space-y-8">
          <Card className="p-6 rounded-[2rem] shadow-sm border-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-xl">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-lg">Mon Profil</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email de connexion</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={user?.email} disabled className="pl-10 bg-muted rounded-xl h-11" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Compte sécurisé
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-[2rem] shadow-sm border-primary/5 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                  <BellRing className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Notifications Email</h2>
                  <p className="text-xs text-muted-foreground">Alertes pour vos dons et listes.</p>
                </div>
              </div>
              <Switch 
                checked={emailNotifications}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </Card>
        </div>

        {/* SECTION SÉCURITÉ */}
        <Card className="p-6 rounded-[2rem] shadow-sm border-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="font-semibold text-lg">Mot de passe</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Nouveau mot de passe</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-xl shadow-lg shadow-primary/10" 
              disabled={loading || !newPassword}
            >
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </Button>
          </form>
        </Card>
      </div>

      {/* ZONE DANGER */}
      <div className="mt-12 pt-8 border-t border-destructive/10">
        <h3 className="text-destructive font-semibold mb-4">Zone de danger</h3>
        <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl">
          Supprimer mon compte Baraka
        </Button>
      </div>
    </div>
  );
}