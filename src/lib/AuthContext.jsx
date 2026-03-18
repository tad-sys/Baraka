import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const fetchUserProfile = async (sessionUser) => {
    if (!sessionUser) return null;
    try {
      // On met un timeout pour ne pas bloquer le site si la base rame
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', sessionUser.id)
        .single();

      if (error) return sessionUser;
      return { ...sessionUser, is_admin: data?.is_admin || false };
    } catch (err) {
      return sessionUser;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // IMPORTANT: On définit l'utilisateur de base TOUT DE SUITE pour débloquer le site
          setUser(session.user);
          setIsLoadingAuth(false); // On libère l'affichage ICI

          // Puis on cherche le profil admin en arrière-plan
          const fullUser = await fetchUserProfile(session.user);
          setUser(fullUser);
        } else {
          setUser(null);
          setIsLoadingAuth(false);
        }
      } catch (e) {
        setIsLoadingAuth(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
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
      options: { emailRedirectTo: options.redirectTo }
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
    
    return await supabase.auth.resetPasswordForEmail(email, { redirectTo });
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