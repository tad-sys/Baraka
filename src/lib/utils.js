import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fusionne les classes Tailwind proprement
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Détecte si l'app est dans une iframe
 */
export const isIframe = typeof window !== 'undefined' && window.self !== window.top;

/**
 * Génère une URL compatible avec le HashRouter.
 * CORRECTION : Retourne un chemin relatif pour que <Link> fonctionne.
 */
export function createPageUrl(pageName, params) {
    // On nettoie le nom de la page (espaces -> tirets)
    const formattedPage = pageName.replace(/ /g, '-');
    
    let queryString = "";
    if (params) {
        const searchParams = new URLSearchParams(params);
        queryString = `?${searchParams.toString()}`;
    }

    // IMPORTANT : Pour React Router (Link), on retourne juste le chemin.
    // Le HashRouter s'occupera d'ajouter le '#' automatiquement.
    return `/${formattedPage}${queryString}`;
}

/**
 * Formate un nombre en devise Euro
 */
export function formatPrice(amount) {
    if (amount === undefined || amount === null) return "0,00 €";
    
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}