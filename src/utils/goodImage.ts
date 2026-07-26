/**
 * Restituisce il percorso dell'immagine a partire dall'ID della merce.
 * Esegue la conversione degli underscore (_) in trattini (-) per combaciare con i nomi dei file.
 */
export const getGoodImagePath = (goodId: string): string => {
  const filename = goodId.toLowerCase().replace(/_/g, '-') + '.png';
  return `/images/goods/${filename}`;
};
