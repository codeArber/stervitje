import { useQuery } from '@tanstack/react-query';

export function useTikTokThumbnail(url: string | null) {
  return useQuery({
    queryKey: ['tiktokThumbnail', url],
    enabled: !!url,                    // don’t run when url is null/empty
    queryFn: async () => {
      const r = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(url!)}` // see note ↓
      );
      const json = await r.json();
      return json.thumbnail_url as string;
    },
    staleTime: 1000 * 60 * 60,         // 1 h
  });
}
