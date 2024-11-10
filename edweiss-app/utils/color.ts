// Fonction pour convertir le code hex en RGB
export const hexToRgb = (hex: string) => {
    // Regex pour vérifier si le code hex est valide
    const hexCode = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    // Si le code hex est valide
    if (hexCode) {
        // Retourner les valeurs RGB
        return {
            r: parseInt(hexCode[1], 16),
            g: parseInt(hexCode[2], 16),
            b: parseInt(hexCode[3], 16),
        };
    }
};