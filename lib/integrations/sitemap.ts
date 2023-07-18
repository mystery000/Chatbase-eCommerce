import { CrawledData } from '@/types/types';

export const crawlSitemap = async (
  url: string,
): Promise<CrawledData | null> => {
  const res = await fetch('/api/integrations/sitemap', {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  });
  if (res.ok) {
    return (await res.json()) as CrawledData;
  }
  return null;
};
