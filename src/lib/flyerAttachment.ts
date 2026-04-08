/** True when the stored flyer URL points at a PDF (Discover uses a document affordance, not <img>). */
export function isPdfFlyerUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const base = url.split('#')[0] ?? url;
  return /\.pdf(\?|$)/i.test(base);
}
