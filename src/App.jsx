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

// --- COMPOSANT DE PROTECTION DES ROUTES ---
const ProtectedRoute = ({ children }) => {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) return null;

  if (!user) {
    return <Navigate to="/Auth" state={{ from: location }} replace />;
  }

  return children;
};

// --- COMPOSANT DE SÉCURITÉ ADMIN ---
const AdminOnly = ({ children }) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) return null;

  if (user?.is_admin !== true) {
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

  // Sécurité : Si le chargement dure plus de 5 secondes, on force l'entrée
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoadingAuth || isLoadingPublicSettings) {
        console.warn("Délai d'attente dépassé : chargement forcé.");
        setTimedOut(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isLoadingAuth, isLoadingPublicSettings]);

  // Si on charge encore ET qu'on n'a pas dépassé le délai, on montre le spinner
  if ((isLoadingPublicSettings || isLoadingAuth) && !timedOut) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Chargement des données...</p>
      </div>
    );
  }

  const privatePages = ['MyLists', 'ManageList', 'CreateList', 'Settings', 'AdminModeration'];

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/Auth" replace />} />
      
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />

      {Object.entries(Pages).map(([path, Page]) => {
        const isPrivate = privatePages.includes(path);
        const isAdminPage = path === 'AdminModeration'; 
        
        return (
          <Route key={path} path={`/${path}`} element={
            isPrivate ? (
              <ProtectedRoute>
                {isAdminPage ? (
                  <AdminOnly>
                    <LayoutWrapper currentPageName={path}>
                      <Page />
                    </LayoutWrapper>
                  </AdminOnly>
                ) : (
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                )
                }
              </ProtectedRoute>
            ) : (
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            )
          } />
        );
      })}

      <Route path="/Baraka" element={<Navigate to="/" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App;