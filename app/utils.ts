export const normalizeThumbnail = (url?: string | null) => {
  if (!url) return undefined;
  return url.replace(/^http:/i, 'https:');
};

export const openLibraryCover = (isbn?: string | null, size: 'S'|'M'|'L' = 'L') => {
  if (!isbn) return undefined;
  const cleaned = String(isbn).replace(/[^0-9Xx]/g, '');
  return `https://covers.openlibrary.org/b/isbn/${cleaned}-${size}.jpg`;
};
