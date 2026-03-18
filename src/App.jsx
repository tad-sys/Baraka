import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from '@/pages.config'
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import React, { useState, useEffect } from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// --- PROTECTION ---
const ProtectedRoute = ({ children, forceShow }) => {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth && !forceShow) return null;

  if (!user) {
    // On redirige vers /Auth si l'utilisateur n'est pas connecté
    return <Navigate to="/Auth" state={{ from: location }} replace />;
  }

  return children;
};

const AdminOnly = ({ children, forceShow }) => {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth && !forceShow) return null;
  if (!user || user?.is_admin !== true) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoadingAuth || isLoadingPublicSettings) {
        console.warn("BYPASS ACTIVÉ : Libération de l'interface.");
        setTimedOut(true);
      }
    }, 3000); 
    return () => clearTimeout(timer);
  }, [isLoadingAuth, isLoadingPublicSettings]);

  if ((isLoadingPublicSettings || isLoadingAuth) && !timedOut) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Chargement Baraka...</p>
      </div>
    );
  }

  const privatePages = ['MyLists', 'ManageList', 'CreateList', 'Settings', 'AdminModeration'];

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/Auth" replace />} />
      
      {/* Route Racine */}
      <Route path="/" element={<LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>} />

      {/* Génération dynamique des routes */}
      {Object.entries(Pages).map(([path, Page]) => {
        // Normalisation du chemin : on s'assure qu'il n'y a pas d'espaces
        const routePath = path.replace(/ /g, '-');
        const isPrivate = privatePages.includes(path);
        const isAdminPage = path === 'AdminModeration'; 
        
        return (
          <Route key={path} path={`/${routePath}`} element={
            isPrivate ? (
              <ProtectedRoute forceShow={timedOut}>
                {isAdminPage ? (
                  <AdminOnly forceShow={timedOut}>
                    <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
                  </AdminOnly>
                ) : (
                  <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
                )}
              </ProtectedRoute>
            ) : (
              <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
            )
          } />
        );
      })}

      {/* Gestion spécifique de la redirection GitHub Pages /Baraka/ */}
      <Route path="/Baraka" element={<Navigate to="/" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        {/* Le HashRouter ne nécessite pas de basename car il utilise le # */}
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;