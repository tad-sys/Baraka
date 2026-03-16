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
 * Génère une URL compatible avec le HashRouter de GitHub Pages.
 */
export function createPageUrl(pageName, params) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const base = `${origin}${pathname}${pathname.endsWith('/') ? '' : '/'}`;
    
    let queryString = "";
    if (params) {
        const searchParams = new URLSearchParams(params);
        queryString = `?${searchParams.toString()}`;
    }

    return `${base}#/${pageName.replace(/ /g, '-')}${queryString}`;
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