import React from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Heart, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Success() {
  const [searchParams] = useSearchParams();
  const listId = searchParams.get('listId');

  // --- LOGIQUE DE LIEN SÉCURISÉE ---
  const getSafeUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const base = `${origin}${pathname}${pathname.endsWith('/') ? '' : '/'}`;
    // On construit l'URL avec le Hash (#) pour GitHub Pages
    return listId 
      ? `${base}#/ListDetail?id=${listId}` 
      : `${base}#/Explore`;
  };

  const handleShare = async () => {
    const shareUrl = getSafeUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "J'ai soutenu une cause sur Baraka",
          text: "Rejoignez-moi pour faire rayonner la solidarité !",
          url: shareUrl,
        });
      } catch (err) {
        console.log("Erreur de partage:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié dans le presse-papier !");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        {/* Animation de l'icône de succès */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative"
        >
          <CheckCircle2 className="w-12 h-12 text-primary z-10" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-primary/20 rounded-full"
          />
          <Sparkles className="absolute -top-1 -right-1 text-yellow-500 w-6 h-6 animate-pulse" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-display font-bold mb-4">Baraka Allahou fik !</h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Votre don a été enregistré avec succès. Merci de contribuer à cette noble cause et de faire rayonner la solidarité au sein de la communauté.
          </p>

          <div className="space-y-4">
            {/* Action principale : Retourner à la liste ou explorer */}
            <Button asChild className="w-full h-14 rounded-2xl text-lg shadow-lg shadow-primary/20 group">
              <Link to={listId ? `/ListDetail?id=${listId}` : "/Explore"}>
                {listId ? "Retourner au projet" : "Continuer d'explorer"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {/* Bouton de partage avec gestion du fallback */}
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-primary/10 hover:bg-primary/5 transition-all gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Partager cette cause
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/10 inline-flex items-center gap-3 text-primary"
          >
            <Heart className="w-5 h-5 fill-primary" />
            <span className="text-sm font-medium text-primary/80 italic">Chaque don est une graine de bien.</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}