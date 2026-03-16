import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Fonction pour récupérer les infos supplémentaires (is_admin) depuis la table profiles
  const fetchUserProfile = async (sessionUser) => {
    if (!sessionUser) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', sessionUser.id)
        .single();

      if (error) {
        console.warn("Profil non trouvé ou erreur:", error.message);
        return sessionUser; // On retourne au moins le user de base
      }

      // On fusionne les infos d'auth et les infos de la table profiles
      return { ...sessionUser, is_admin: data?.is_admin || false };
    } catch (err) {
      console.error("Erreur fetchUserProfile:", err);
      return sessionUser;
    }
  };

  useEffect(() => {
    // 1. Vérification de la session initiale
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    };

    initializeAuth();

    // 2. Écoute des changements d'état (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user);
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email, password, options = {}) => 
    supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: options.redirectTo 
      }
    });

  const signIn = (email, password) => 
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const resetPassword = async (email, options = {}) => {
    const origin = window.location.origin;
    const path = window.location.pathname.endsWith('/') 
                  ? window.location.pathname 
                  : window.location.pathname + '/';
    
    const defaultRedirect = `${origin}${path}#/ResetPassword`;
    const redirectTo = options.redirectTo || defaultRedirect;
    
    return await supabase.auth.resetPasswordForEmail(email, { 
      redirectTo 
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoadingAuth, 
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);