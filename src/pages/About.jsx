import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Heart, ShieldCheck, Users, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function About() {
  const values = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Transparence totale",
      description: "Chaque don est tracé. Les créateurs de listes fournissent des preuves pour chaque action réalisée."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Communauté soudée",
      description: "Baraka connecte ceux qui veulent aider avec des projets concrets, qu'ils soient proches ou lointains."
    },
    {
      icon: <Heart className="w-6 h-6 text-primary" />,
      title: "Zéro commission",
      description: "Nous ne prenons aucun frais sur vos dons. 100% de votre générosité va directement à la cause choisie."
    }
  ];

  const faqs = [
    {
      question: "Est-ce que Baraka prend une commission ?",
      answer: "Non, aucune. Baraka est une plateforme gratuite. 100% de l'argent collecté par les créateurs de listes va directement aux causes. Nous ne touchons aucune commission sur les transactions."
    },
    {
      question: "Comment être sûr que les dons sont bien utilisés ?",
      answer: "La transparence est au cœur de Baraka. Les créateurs de listes s'engagent à fournir des 'Preuves de Don' (photos, reçus, vidéos) pour chaque action validée sur leur liste."
    },
    {
      question: "Comment puis-je créer une liste ?",
      answer: "Il suffit de vous connecter, de cliquer sur 'Créer une liste' et de définir vos objectifs. C'est simple, rapide et accessible à tous."
    },
    {
      question: "Puis-je modifier ma liste après sa création ?",
      answer: "Oui, vous avez un contrôle total. Vous pouvez ajouter de nouvelles actions, modifier les titres ou les objectifs tant que la liste est active."
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Notre Mission</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-bold mb-6 tracking-tight leading-tight">
              Multiplier le bien, <br />
              <span className="text-primary decoration-primary/20 underline underline-offset-8">ensemble.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              Baraka est une plateforme née d'une idée simple : faciliter l'entraide pour les moments importants de la vie. Nous créons un pont entre vos intentions et l'action concrète.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CONCEPT SECTION */}
      <section className="py-24 bg-primary/5 dark:bg-card/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-bold tracking-tight">Comment ça marche ?</h2>
              <div className="space-y-8">
                {[
                  { step: 1, t: "Créez votre liste", d: "Définissez vos objectifs (ex: 50 repas pour les démunis, 10 oliviers à planter)." },
                  { step: 2, t: "Partagez à vos proches", d: "Envoyez le lien de votre liste personnalisée via WhatsApp, SMS ou réseaux sociaux." },
                  { step: 3, t: "Validez l'impact", d: "Une fois les dons reçus, publiez les preuves de réalisation pour inspirer la communauté." }
                ].map((item) => (
                  <div key={item.step} className="flex gap-5 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.t}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center overflow-hidden shadow-2xl"
            >
              <Globe className="w-48 h-48 text-primary/10 absolute animate-[spin_20s_linear_infinite]" />
              <div className="relative z-10 text-center p-8 bg-background/40 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-primary/10 shadow-xl">
                <p className="text-5xl font-display font-bold text-primary mb-2">100%</p>
                <p className="font-semibold tracking-wide uppercase text-xs opacity-80">Éthique & Transparent</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="py-28 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="p-8 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {React.cloneElement(value.icon, { className: "w-7 h-7 transition-colors" })}
              </div>
              <h3 className="text-xl font-bold mb-4">{value.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Questions fréquentes</h2>
          <p className="text-muted-foreground">Tout ce que vous devez savoir sur Baraka.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details 
              key={index}
              whileHover={{ scale: 1.01 }}
              className="group border border-border/50 rounded-[1.5rem] bg-card overflow-hidden transition-all hover:border-primary/30 shadow-sm"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none focus:outline-none">
                <span className="font-bold text-foreground pr-4">{faq.question}</span>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-open:rotate-180 transition-transform duration-300">
                  <ChevronDown className="w-4 h-4 text-primary" />
                </div>
              </summary>
              <div className="px-6 pb-6 text-[15px] text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                {faq.answer}
              </div>
            </motion.details>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-[3.5rem] bg-slate-900 dark:bg-primary/10 p-12 text-center text-white dark:text-foreground border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-primary/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 relative z-10">Prêt à faire rayonner la Baraka ?</h2>
          <p className="text-slate-300 dark:text-muted-foreground mb-10 max-w-xl mx-auto relative z-10 text-lg">
            Que ce soit pour un événement personnel ou une cause qui vous tient à cœur, commencez votre voyage solidaire dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Button asChild size="lg" className="rounded-2xl px-10 h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 border-none transition-all active:scale-95">
              <Link to="/CreateList">Créer ma liste</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl px-10 h-16 border-white/20 text-white hover:bg-white/10 dark:border-primary/20 dark:text-foreground font-bold text-lg transition-all active:scale-95">
              <Link to="/Explore">Explorer les projets</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}