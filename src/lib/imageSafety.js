export const checkImageSafety = async (file) => {
  const API_USER = 'TON_API_USER'; // Remplace par ta clé
  const API_SECRET = 'TON_API_SECRET'; // Remplace par ta clé

  const formData = new FormData();
  formData.append('media', file);
  formData.append('models', 'nudity-2.0,wad,violence,scam');
  formData.append('api_user', API_USER);
  formData.append('api_secret', API_SECRET);

  try {
    const response = await fetch('https://api.sightengine.com/1.0/check.json', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();

    if (data.status === 'success') {
      // On définit les seuils de tolérance (0.5 = 50% de probabilité)
      const isInappropriate = 
        data.nudity.sexual_display > 0.5 || 
        data.weapon > 0.3 || 
        data.violence > 0.3 ||
        data.alcohol > 0.5;

      if (isInappropriate) {
        return { safe: false, message: "L'image contient du contenu inapproprié (violence, nudité, etc)." };
      }
      return { safe: true };
    }
    return { safe: true }; // En cas d'erreur API, on laisse passer par défaut
  } catch (error) {
    console.error("Erreur de modération:", error);
    return { safe: true };
  }
};