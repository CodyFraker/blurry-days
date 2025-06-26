import { z } from 'zod';

// RSS Feed URL for Grainydays channel
const RSS_FEED_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7TizprGknbDalbHplROtag';

// Zod schema for RSS item
const RSSItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  published: z.string(),
  updated: z.string(),
  'media:group': z.object({
    'media:title': z.string(),
    'media:description': z.string(),
    'media:thumbnail': z.array(z.object({
      $: z.object({
        url: z.string(),
        width: z.string(),
        height: z.string()
      })
    }))
  })
});

const RSSFeedSchema = z.object({
  feed: z.object({
    entry: z.array(RSSItemSchema)
  })
});

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

export async function fetchLatestVideos(maxVideos: number = 10): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(RSS_FEED_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
    
    // Convert XML to JSON-like structure for easier parsing
    const entries = Array.from(xmlDoc.querySelectorAll('entry')).map(entry => {
      const id = entry.querySelector('id')?.textContent || '';
      const title = entry.querySelector('title')?.textContent || '';
      const published = entry.querySelector('published')?.textContent || '';
      const updated = entry.querySelector('updated')?.textContent || '';
      
      const mediaGroup = entry.querySelector('media\\:group, media:group');
      const mediaTitle = mediaGroup?.querySelector('media\\:title, media:title')?.textContent || '';
      const mediaDescription = mediaGroup?.querySelector('media\\:description, media:description')?.textContent || '';
      
      const thumbnails = Array.from(mediaGroup?.querySelectorAll('media\\:thumbnail, media:thumbnail') || []).map(thumb => ({
        url: thumb.getAttribute('url') || '',
        width: thumb.getAttribute('width') || '',
        height: thumb.getAttribute('height') || ''
      }));

      return {
        id: extractVideoId(id),
        title: mediaTitle || title,
        published,
        updated,
        'media:group': {
          'media:title': mediaTitle,
          'media:description': mediaDescription,
          'media:thumbnail': thumbnails
        }
      };
    });

    // Parse and validate the data
    const parsedData = RSSFeedSchema.parse({ feed: { entry: entries } });
    
    // Convert to our format and limit results
    const videos: YouTubeVideo[] = parsedData.feed.entry
      .slice(0, maxVideos)
      .map(entry => ({
        id: entry.id,
        title: entry['media:group']['media:title'],
        description: entry['media:group']['media:description'],
        thumbnail: entry['media:group']['media:thumbnail'][0]?.url || '',
        publishedAt: entry.published
      }));

    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    throw new Error('Failed to fetch YouTube videos');
  }
}

function extractVideoId(url: string): string {
  // Extract video ID from YouTube URL
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : url;
}

// Mock data for development/testing
export function getMockVideos(): YouTubeVideo[] {
  return [
    {
      id: 'mock1',
      title: 'Shooting Film in the Rain - Leica M6 Review',
      description: 'Testing the Leica M6 in challenging weather conditions...',
      thumbnail: 'https://via.placeholder.com/480x360/000000/FFFFFF?text=Grainydays',
      publishedAt: new Date().toISOString()
    },
    {
      id: 'mock2',
      title: 'Portra 400 vs Ektar 100 - Color Film Comparison',
      description: 'Comparing two popular color film stocks...',
      thumbnail: 'https://via.placeholder.com/480x360/000000/FFFFFF?text=Grainydays',
      publishedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'mock3',
      title: 'Street Photography with the Canon AE-1',
      description: 'Exploring urban landscapes with classic equipment...',
      thumbnail: 'https://via.placeholder.com/480x360/000000/FFFFFF?text=Grainydays',
      publishedAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
} 