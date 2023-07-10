export const crwalWebsiteContentSize = async (
  url: string,
): Promise<number | undefined> => {
  const res = await fetch('/api/integrations/website/crawl', {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
  });
  if (res.ok) {
    return (await res.json()).size;
  }
  return undefined;
};
