import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // On initialise avec une valeur par défaut cohérente (false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // On définit une fonction qui utilise directement le résultat du Media Query
    const onChange = () => {
      setIsMobile(mql.matches)
    }

    // Compatibilité : on essaie addEventListener, sinon on utilise addListener
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange)
    } else {
      mql.addListener(onChange)
    }

    // Mise à jour immédiate à l'initialisation
    setIsMobile(mql.matches)

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", onChange)
      } else {
        mql.removeListener(onChange)
      }
    }
  }, [])

  return isMobile
}