import { VideoMetadataInput } from "./seoBlogGenerator";

/**
 * Fetches and parses the public YouTube Atom RSS feed for any channel.
 * This works 100% free with no API key or quota limitations.
 */
export async function fetchYouTubeChannelRss(channelId: string): Promise<VideoMetadataInput[]> {
  if (!channelId) return [];

  const cleanChannelId = channelId.trim();
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${cleanChannelId}`;

  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 300 }, // Cache up to 5 mins
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ModularHomeBot/1.0)",
      },
    });

    if (!response.ok) {
      console.warn(`YouTube RSS Feed returned ${response.status} for channel ${cleanChannelId}`);
      return [];
    }

    const xml = await response.text();
    return parseYouTubeAtomFeed(xml, cleanChannelId);
  } catch (error) {
    console.error("Error fetching YouTube RSS feed:", error);
    return [];
  }
}

/**
 * Parses Atom XML entries into standardized VideoMetadataInput objects
 */
export function parseYouTubeAtomFeed(xml: string, fallbackChannelId: string): VideoMetadataInput[] {
  const videos: VideoMetadataInput[] = [];

  // Extract author / channel name
  const channelTitleMatch = xml.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/i);
  const channelTitle = channelTitleMatch ? channelTitleMatch[1].trim() : "ModularHome";

  // Split into entry blocks
  const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/gi);
  if (!entryMatches || entryMatches.length === 0) {
    return [];
  }

  for (const entry of entryMatches) {
    const videoIdMatch =
      entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/i) ||
      entry.match(/<id>.*?video:([a-zA-Z0-9_-]+)<\/id>/i);
    
    if (!videoIdMatch || !videoIdMatch[1]) continue;
    const youtubeVideoId = videoIdMatch[1].trim();

    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
      : "Modular Home Walkthrough";

    const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/i);
    const publishedAt = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();

    const descMatch =
      entry.match(/<media:description>([\s\S]*?)<\/media:description>/i) ||
      entry.match(/<summary>([\s\S]*?)<\/summary>/i);
    const description = descMatch
      ? descMatch[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
      : "";

    const thumbnailMatch =
      entry.match(/<media:thumbnail url="([\s\S]*?)"/i) ||
      entry.match(/url="([^"]*?hqdefault\.jpg[^"]*?)"/i);
    
    const thumbnail = thumbnailMatch
      ? thumbnailMatch[1].trim()
      : `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;

    videos.push({
      youtubeVideoId,
      title,
      description,
      publishedAt,
      thumbnail,
      channelTitle,
      category: "Building Tours",
    });
  }

  return videos;
}
