import { QueryClient } from "@tanstack/react-query";

// Ajoutez bien "export" devant "const"
export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});