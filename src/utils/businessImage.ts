/**
 * Restituisce il percorso dell'immagine dell'impresa a partire dal suo ID.
 * Converte gli underscore (_) in trattini (-) per combaciare con i nomi dei file.
 */
export const getBusinessImagePath = (businessId: string): string => {
  const filename = businessId.toLowerCase().replace(/_/g, '-') + '.png';
  return `/images/businesses/${filename}`;
};
