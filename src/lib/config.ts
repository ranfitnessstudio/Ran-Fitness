export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ran-fitness.vercel.app');

export const API_URL = `${SITE_URL}/api`;
