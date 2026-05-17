const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatCurrency = (amount) => currencyFormatter.format(Number(amount || 0));

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const formatDate = (value, options = {}) => {
  if (!value) return 'TBD';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const formatShortDate = (value) =>
  formatDate(value, {
    month: 'short',
    day: 'numeric',
  });

export const calculateCountdown = (targetDate) => {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const difference = Math.max(target - now, 0);

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    completed: difference === 0,
  };
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'CC';

export const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getMediaKind = (value = '') => {
  const url = String(value || '').trim().toLowerCase();

  if (!url) return 'empty';
  if (/instagram\.com\/(p|reel|tv)\//.test(url)) return 'instagram';
  if (/\.(mp4|webm|ogg|mov)(\?|#|$)/.test(url)) return 'video';
  return 'image';
};

export const getInstagramEmbedUrl = (value = '') => {
  const match = String(value || '').match(/instagram\.com\/(p|reel|tv)\/([^/?#]+)/i);
  if (!match) return '';

  const [, type, code] = match;
  return `https://www.instagram.com/${type}/${code}/embed/captioned/`;
};
