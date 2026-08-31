const CATEGORY_IMAGES: Record<string, string[]> = {
  Education: [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
  ],
  Health: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  ],
  Environment: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  ],
  'Disaster Relief': [
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=800&q=80',
  ],
  Community: [
    'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
  ],
  'Animal Welfare': [
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  ],
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';

const hashSeed = (seed: string | number): number => {
  if (typeof seed === 'number') return Math.abs(seed);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getSVGDataUri = (category: string = 'Campaign') => {
  const bgColors: Record<string, string> = {
    Education: '%234f46e5',
    Health: '%23059669',
    Environment: '%2316a34a',
    'Disaster Relief': '%23dc2626',
    Community: '%23d97706',
    'Animal Welfare': '%230284c7',
  };
  const color = bgColors[category] || '%234f46e5';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="%231e1b4b"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="32" font-weight="bold" opacity="0.95">${encodeURIComponent(category)}</text></svg>`;
};

export const getCategoryFallbackImage = (category?: string, seed: string | number = 0): string => {
  if (!category) return DEFAULT_IMAGE;
  
  const key = Object.keys(CATEGORY_IMAGES).find(
    (cat) => cat.toLowerCase() === category.toLowerCase()
  );
  
  if (key && CATEGORY_IMAGES[key]?.length > 0) {
    const list = CATEGORY_IMAGES[key];
    const index = hashSeed(seed) % list.length;
    return list[index];
  }
  
  return DEFAULT_IMAGE;
};

export const getCampaignImage = (imageSrc?: string, category?: string, seed: string | number = 0): string => {
  if (
    imageSrc &&
    imageSrc.trim() !== '' &&
    !imageSrc.includes('picsum.photos') &&
    (imageSrc.startsWith('http') || imageSrc.startsWith('data:'))
  ) {
    return imageSrc;
  }
  return getCategoryFallbackImage(category, seed);
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string,
  seed: string | number = 0
) => {
  const target = e.currentTarget;
  const currentCount = parseInt(target.dataset.errorCount || '0', 10);
  
  const key = Object.keys(CATEGORY_IMAGES).find(
    (cat) => cat.toLowerCase() === (category || '').toLowerCase()
  );
  
  const list = (key && CATEGORY_IMAGES[key]) ? CATEGORY_IMAGES[key] : [DEFAULT_IMAGE];
  
  if (currentCount < list.length) {
    target.dataset.errorCount = (currentCount + 1).toString();
    const nextIndex = (hashSeed(seed) + currentCount + 1) % list.length;
    target.src = list[nextIndex];
  } else {
    // If external images fail (e.g. adblocker or offline), render beautiful SVG gradient banner
    target.src = getSVGDataUri(category || 'GiveHope');
  }
};
