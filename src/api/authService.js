import { createClient } from '@supabase/supabase-js'

// Remplace par tes vraies clés trouvées dans Settings > API sur Supabase
const supabaseUrl = 'https://votre-projet.supabase.co'
const supabaseAnonKey = 'votre-cle-anon'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const authService = {
  // Connexion via Google (ou GitHub, etc.)
  login: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        // Supabase renverra l'utilisateur exactement ici après la connexion
        redirectTo: window.location.origin 
      }
    })
  },
  
  logout: async () => {
    await supabase.auth.signOut()
  },

  // Récupérer l'utilisateur actuel
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}